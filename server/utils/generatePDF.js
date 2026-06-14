    const PDFDocument = require('pdfkit');

    const generateInvoicePDF = (invoice) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });
        const buffers = [];

        doc.on('data', (chunk) => buffers.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', reject);

        doc.fontSize(28).font('Helvetica-Bold').fillColor('#1a1a2e').text('NEXUS CORPORATE SERVICES', 50, 50);
        doc.fontSize(11).font('Helvetica').fillColor('#666666').text('123 Financial District, New York, NY 10004', 50, 85);
        doc.text('billing@nexuscorporate.com | +1 (212) 555-0100', 50, 100);

        doc.moveTo(50, 125).lineTo(545, 125).strokeColor('#e0e0e0').stroke();

        if (invoice.status === 'paid') {
        doc.save();
        doc.rotate(-30, { origin: [300, 350] });
        doc.fontSize(80).font('Helvetica-Bold').fillColor('#00b894').opacity(0.15).text('PAID', 150, 300);
        doc.restore();
        doc.opacity(1);
        }

        doc.fontSize(22).font('Helvetica-Bold').fillColor('#1a1a2e').text('INVOICE', 50, 145);
        doc.fontSize(11).font('Helvetica').fillColor('#333333');
        doc.text(`Invoice Number: ${invoice.invoiceNumber}`, 50, 175);
        doc.text(`Issue Date: ${new Date(invoice.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 50, 192);
        doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 50, 209);
        doc.text(`Status: ${invoice.status.toUpperCase()}`, 50, 226);

        doc.fontSize(12).font('Helvetica-Bold').fillColor('#1a1a2e').text('BILLED TO', 350, 175);
        doc.fontSize(11).font('Helvetica').fillColor('#333333');
        doc.text(invoice.clientName, 350, 192);
        doc.text(invoice.clientEmail, 350, 209);

        doc.moveTo(50, 260).lineTo(545, 260).strokeColor('#e0e0e0').stroke();

        doc.fillColor('#f8f9fa').rect(50, 265, 495, 25).fill();
        doc.fontSize(10).font('Helvetica-Bold').fillColor('#333333');
        doc.text('DESCRIPTION', 60, 273);
        doc.text('QTY', 340, 273);
        doc.text('UNIT PRICE', 390, 273);
        doc.text('TOTAL', 480, 273);

        let yPos = 300;
        invoice.items.forEach((item, index) => {
        if (index % 2 === 0) {
            doc.fillColor('#fafafa').rect(50, yPos - 5, 495, 22).fill();
        }
        doc.fontSize(10).font('Helvetica').fillColor('#333333');
        doc.text(item.description, 60, yPos, { width: 270 });
        doc.text(item.quantity.toString(), 340, yPos);
        doc.text(`$${item.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 390, yPos);
        doc.text(`$${(item.quantity * item.unitPrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 480, yPos);
        yPos += 25;
        });

        yPos += 10;
        doc.moveTo(350, yPos).lineTo(545, yPos).strokeColor('#e0e0e0').stroke();
        yPos += 10;

        doc.fontSize(10).font('Helvetica').fillColor('#666666');
        doc.text('Subtotal', 380, yPos);
        doc.text(`$${invoice.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 480, yPos);
        yPos += 18;

        doc.text('Tax', 380, yPos);
        doc.text(`$${invoice.tax.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 480, yPos);
        yPos += 18;

        doc.moveTo(350, yPos).lineTo(545, yPos).strokeColor('#333333').stroke();
        yPos += 10;

        doc.fontSize(12).font('Helvetica-Bold').fillColor('#1a1a2e');
        doc.text('TOTAL DUE', 370, yPos);
        doc.text(`$${invoice.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 470, yPos);

        if (invoice.notes) {
        yPos += 50;
        doc.fontSize(10).font('Helvetica-Bold').fillColor('#333333').text('Notes:', 50, yPos);
        doc.font('Helvetica').fillColor('#666666').text(invoice.notes, 50, yPos + 15, { width: 495 });
        }

        const bottomY = 720;
        doc.moveTo(50, bottomY).lineTo(545, bottomY).strokeColor('#e0e0e0').stroke();
        doc.fontSize(9).font('Helvetica').fillColor('#999999').text('Thank you for your business. Payment is due within 30 days.', 50, bottomY + 10, { align: 'center', width: 495 });

        doc.end();
    });
    };

    module.exports = generateInvoicePDF;