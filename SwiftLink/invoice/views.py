from django.http import HttpResponse
from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from Order.models import Order
from rest_framework.permissions import IsAuthenticated
from Workforce.models import WorkForce
from rest_framework.response import Response
from .models import Invoice
from .serializers import InvoiceSerializer
from decimal import Decimal
from django.template.loader import render_to_string
from xhtml2pdf import pisa
from io import BytesIO
from django.core.mail import EmailMessage
from Client.models import ClientMembership, Client
from django.utils import timezone
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def init_invoice(request, order_id):
    try:
        order = Order.objects.get(orderID=order_id)
        helper = WorkForce.objects.get(UserId=request.user)

        invoice = Invoice.objects.filter(order=order).first()

        # Prix du service
        unit_price = helper.hourlyRatebyService or 0
        duration_in_hours = Decimal(order.orderDuration.total_seconds()) / Decimal(3600) if order.orderDuration else Decimal(0)

        base_amount = unit_price * duration_in_hours
        extras = []
        total = base_amount

        # Membership handling
        membership = ClientMembership.objects.filter(client=order.clientID).first()
        if membership:
            m_type = membership.membership.membershipType
            label = ''
            price = Decimal('0')
            if m_type == 'pay-per-use':
                label = 'Pay-per-use Fee'
                price = membership.membership.cost
            elif m_type in ['preferred', 'ultimate']:
                label = f"{m_type.capitalize()} Member- Unlimited bookings"
                if membership.status == 'pending':
                    price = membership.membership.cost
                    membership.status = 'active'
                    membership.startDate = timezone.now().date()
                    membership.save()
            if label:
                extras.append({'label': label, 'price': float(price)})
                total += price

        if invoice:
            serializer = InvoiceSerializer(invoice)
            data = serializer.data
            data['extras'] += extras
            data['totalAmount'] = float(Decimal(data['totalAmount']) + sum(Decimal(str(e['price'])) for e in extras))
        else:
            data = {
                'invoiceID': None,
                'orderID': order.orderID,
                'serviceType': order.serviceType,
                'duration': order.orderDuration,
                'unitPrice': unit_price,
                'baseAmount': base_amount,
                'extras': extras,
                'totalAmount': float(total),
                'status': Invoice.InvoiceStatus.FUTURE_PAYMENT,
                'description': ''
            }
        return Response(data)
    except (Order.DoesNotExist, WorkForce.DoesNotExist):
        return Response({'error': 'Order or helper not found'}, status=404)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def client_invoices(request):
    try:
        client = Client.objects.get(UserId=request.user)
    except Client.DoesNotExist:
        return Response({'error': 'Client not found'}, status=404)

    invoices = Invoice.objects.filter(order__clientID=client)
    serializer = InvoiceSerializer(invoices, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def invoice_detail(request, invoice_id):
    try:
        invoice = Invoice.objects.get(pk=invoice_id)
    except Invoice.DoesNotExist:
        return Response({'error': 'Invoice not found'}, status=404)

    if invoice.order.clientID.UserId != request.user:
        return Response({'error': 'Unauthorized'}, status=403)

    serializer = InvoiceSerializer(invoice)
    return Response(serializer.data)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_invoice(request, order_id):
    try:
        order = Order.objects.get(orderID=order_id)
        helper = WorkForce.objects.get(UserId=request.user)

        if not order.orderDuration:
            return Response({'error': 'Order duration is missing, cannot create invoice.'}, status=400)

        data = request.data

        # Remplace get_or_create par try/except
        try:
            invoice = Invoice.objects.get(order=order)
            created = False
        except Invoice.DoesNotExist:
            invoice = Invoice(order=order)
            created = True

        invoice.helper = helper
        invoice.serviceType = data.get('serviceType')
        invoice.duration = order.orderDuration
        invoice.unitPrice = data.get('unitPrice')
        invoice.baseAmount = data.get('baseAmount')
        invoice.extras = data.get('extras', [])
        invoice.totalAmount = data.get('totalAmount')
        invoice.status = data.get('status', Invoice.InvoiceStatus.FUTURE_PAYMENT)
        invoice.description = data.get('description', '')
        invoice.sentToClient = True
        invoice.save()

        # ➔ Générer le PDF
        html_content = render_to_string('invoice_template.html', {'invoice': invoice})
        pdf_file = BytesIO()
        pisa_status = pisa.CreatePDF(html_content, dest=pdf_file)

        if pisa_status.err:
            return Response({'error': 'Failed to generate PDF'}, status=500)

        pdf_file.seek(0)

        # ➔ Envoyer par mail
        subject = f"Invoice #{invoice.invoiceID}"
        message = "Please find attached your invoice."
        email = EmailMessage(
            subject,
            message,
            from_email="aziz.aydi@inotekplus.com",
            to=[order.clientID.UserId.email],
        )
        email.attach(f'Invoice_{invoice.invoiceID}.pdf', pdf_file.read(), 'application/pdf')
        email.send()

        # ➔ Retourner le PDF (pour téléchargement)
        response = HttpResponse(pdf_file, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="Invoice_{invoice.invoiceID}.pdf"'
        return response

    except (Order.DoesNotExist, WorkForce.DoesNotExist):
        return Response({'error': 'Order or helper not found'}, status=404)
