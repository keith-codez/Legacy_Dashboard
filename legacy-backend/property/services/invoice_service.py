from property.services.allocation_service import get_invoice_allocated


def get_invoice_balance(invoice):
    allocated = get_invoice_allocated(invoice)
    return float(invoice.total_amount) - float(allocated)