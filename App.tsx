import React, { useState, useRef, useCallback } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import InvoiceForm from './components/InvoiceForm';
import InvoicePreview from './components/InvoicePreview';
import { InvoiceDetails } from './types';
import { COMPANY_NAME } from './constants';
import { DownloadIcon, ImageFileIcon, DocumentIcon, WhatsAppIcon } from './components/Icons';

const App: React.FC = () => {
  const [invoiceDetails, setInvoiceDetails] = useState<InvoiceDetails | null>(null);
  const invoicePreviewRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false);

  const handleFormSubmit = useCallback((data: InvoiceDetails) => {
    setInvoiceDetails(data);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
  };

  const generateFileName = () => {
    const datePart = invoiceDetails?.invoiceDate 
      ? new Date(invoiceDetails.invoiceDate.includes('T') ? invoiceDetails.invoiceDate : `${invoiceDetails.invoiceDate}T00:00:00`)
          .toLocaleDateString('id-ID', {day:'2-digit', month:'2-digit', year:'numeric'}).replace(/\//g, '-') 
      : 'invoice';
    const owner = invoiceDetails?.ownerName ? invoiceDetails.ownerName.replace(/\s+/g, '_') : 'customer';
    return `Struk_${COMPANY_NAME.replace(/\s+/g, '_')}_${owner}_${datePart}`;
  }

  const handleDownloadPNG = async () => {
    if (!invoicePreviewRef.current || !invoiceDetails) return;
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(invoicePreviewRef.current, { 
        scale: 2.5, 
        useCORS: true,
        backgroundColor: '#ffffff', 
        logging: false,
      });
      const image = canvas.toDataURL('image/png', 1.0); 
      const link = document.createElement('a');
      link.download = `${generateFileName()}.png`;
      link.href = image;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error generating PNG:", error);
      alert("Gagal membuat file PNG. Silakan coba lagi.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!invoicePreviewRef.current || !invoiceDetails) return;
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(invoicePreviewRef.current, { 
        scale: 2.5, 
        useCORS: true, 
        backgroundColor: '#ffffff', 
        logging: false,
      });
      const imgData = canvas.toDataURL('image/png', 1.0); 
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height] 
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`${generateFileName()}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Gagal membuat file PDF. Silakan coba lagi.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSendToWhatsApp = async () => {
    if (!invoiceDetails || !invoiceDetails.ownerPhone) {
      alert("Nomor HP pemilik belum diisi.");
      return;
    }
    setIsSendingWhatsApp(true);

    let phoneNumber = invoiceDetails.ownerPhone.replace(/\D/g, ''); // Remove non-digits
    if (phoneNumber.startsWith('0')) {
      phoneNumber = '62' + phoneNumber.substring(1);
    } else if (!phoneNumber.startsWith('62')) {
      phoneNumber = '62' + phoneNumber;
    }

    const ownerName = invoiceDetails.ownerName || "Pelanggan";
    const subtotalComponents = invoiceDetails.components.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
    const grandTotal = subtotalComponents + (Number(invoiceDetails.serviceFee) || 0);
    
    const messageText = `✅ Done , Barang servisan milik ${ownerName} telah selesai diperbaiki dengan Total harga perbaikan senilai ${formatCurrency(grandTotal)}. Mohon untuk menyimpan struk ini , jika hilang garansi tidak berlaku`;
    const encodedMessage = encodeURIComponent(messageText);
    const whatsappUrl = `https://api.whatsapp.com/send/?phone=${phoneNumber}&text=${encodedMessage}`;

    try {
      // Give a small delay for visual feedback, then open link
      await new Promise(resolve => setTimeout(resolve, 300));
      window.open(whatsappUrl, '_blank');
    } catch (error) {
      console.error("Error opening WhatsApp:", error);
      alert("Gagal membuka WhatsApp. Pastikan nomor HP valid dan WhatsApp terinstal.");
    } finally {
      setIsSendingWhatsApp(false);
    }
  };
  
  const exampleInitialData: InvoiceDetails = {
    itemName: "Timbangan Digital 40kg",
    ownerName: "Nadia Indah",
    ownerPhone: "081234567890",
    damageType: "rusak bagain load cell",
    invoiceDate: "2025-05-26",
    warrantyPeriod: "1 Minggu",
    components: [
      { id: crypto.randomUUID(), name: "Load Cell Sensor Zemic L6E3", quantity: 1, price: 150000 },
      { id: crypto.randomUUID(), name: "Kabel Power", quantity: 1, price: 25000 },
    ],
    serviceFee: 75000,
  };


  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-cyan-700 tracking-tight">
          {COMPANY_NAME}
        </h1>
        <p className="text-slate-600 mt-2 text-lg">Generator Struk Servis</p>
      </header>

      <div className="container mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 bg-white p-1 rounded-xl shadow-2xl self-start">
          <InvoiceForm onSubmit={handleFormSubmit} initialData={exampleInitialData} />
        </div>

        <div className="lg:col-span-3">
          {invoiceDetails ? (
            <div className="sticky top-8">
              <h2 className="text-2xl font-semibold text-cyan-700 mb-4 text-center lg:text-left">Pratinjau Struk</h2>
              <div className="max-h-[calc(100vh-230px)] overflow-y-auto p-1 bg-slate-200 rounded-lg shadow-inner mb-6">
                <InvoicePreview data={invoiceDetails} previewRef={invoicePreviewRef} />
              </div>
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <button
                  onClick={handleDownloadPNG}
                  disabled={isDownloading || isSendingWhatsApp}
                  className="flex items-center justify-center w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2.5 px-5 rounded-lg shadow-md hover:shadow-lg transition duration-150 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <ImageFileIcon className="w-5 h-5 mr-2" /> {isDownloading ? 'Memproses...' : 'Unduh PNG'}
                </button>
                <button
                  onClick={handleDownloadPDF}
                  disabled={isDownloading || isSendingWhatsApp}
                  className="flex items-center justify-center w-full sm:w-auto bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2.5 px-5 rounded-lg shadow-md hover:shadow-lg transition duration-150 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <DocumentIcon className="w-5 h-5 mr-2" /> {isDownloading ? 'Memproses...' : 'Unduh PDF'}
                </button>
                <button
                  onClick={handleSendToWhatsApp}
                  disabled={isDownloading || isSendingWhatsApp || !invoiceDetails?.ownerPhone}
                  className="flex items-center justify-center w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 px-5 rounded-lg shadow-md hover:shadow-lg transition duration-150 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed"
                  title={!invoiceDetails?.ownerPhone ? "Isi nomor HP pemilik untuk mengirim via WhatsApp" : "Kirim ke WhatsApp"}
                >
                  <WhatsAppIcon className="w-5 h-5 mr-2" /> {isSendingWhatsApp ? 'Mengirim...' : 'Kirim ke WhatsApp'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full bg-white p-10 rounded-lg shadow-xl text-center">
              <DownloadIcon className="w-24 h-24 text-slate-300 mb-6" />
              <h2 className="text-2xl font-semibold text-slate-600 mb-2">Pratinjau Struk Akan Tampil Disini</h2>
              <p className="text-slate-500">Isi formulir di sebelah kiri untuk membuat struk servis.</p>
            </div>
          )}
        </div>
      </div>
      <footer className="text-center mt-12 py-6 border-t border-slate-300">
        <p className="text-sm text-slate-500">&copy; {new Date().getFullYear()} {COMPANY_NAME}. Dibuat dengan penuh semangat.</p>
      </footer>
    </div>
  );
};

export default App;