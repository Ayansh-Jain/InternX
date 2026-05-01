try:
    from xhtml2pdf import pisa
    print("xhtml2pdf imported successfully")
except Exception as e:
    print(f"xhtml2pdf import failed: {e}")

try:
    from docx import Document
    print("python-docx imported successfully")
except Exception as e:
    print(f"python-docx import failed: {e}")

try:
    from reportlab.pdfgen import canvas
    print("reportlab imported successfully")
except Exception as e:
    print(f"reportlab import failed: {e}")
