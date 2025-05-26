import React from 'react';
    import { InvoiceDetails } from '../types';
    import { COMPANY_NAME, CONTACT_PHONE, CONTACT_ADDRESS } from '../constants';
    import { PhoneIcon, LocationMarkerIcon } from './Icons';

    interface InvoicePreviewProps {
      data: InvoiceDetails;
      previewRef: React.RefObject<HTMLDivElement>;
    }
    
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
    };

    const formatDate = (dateString: string) => {
      if (!dateString) return 'Tanggal tidak valid';
      try {
        const dateObj = new Date(dateString.includes('T') ? dateString : `${dateString}T00:00:00`);
        return dateObj.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      } catch (error) {
        console.error("Error formatting date:", dateString, error);
        return 'Format tanggal salah';
      }
    };

    const InvoicePreview: React.FC<InvoicePreviewProps> = ({ data, previewRef }) => {
      const subtotalComponents = data.components.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
      const grandTotal = subtotalComponents + (Number(data.serviceFee) || 0);

      return (
        <div 
          ref={previewRef} 
          className="p-8 bg-white shadow-lg rounded-lg max-w-xl mx-auto font-sans leading-relaxed text-slate-800" 
          id="invoice-preview"
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-6 pb-4 border-b-2 border-cyan-500">
            <h1 className="text-3xl font-bold text-cyan-600 tracking-tight">{COMPANY_NAME}</h1>
            <div className="text-right text-sm">
              <p className="text-slate-500">Tanggal Struk:</p>
              <p className="font-semibold text-slate-700">{formatDate(data.invoiceDate)}</p>
            </div>
          </div>

          {/* Customer and Item Details */}
          <div className="mb-6">
            <div className="mb-4">
              <h2 className="text-xs uppercase font-semibold text-slate-500 tracking-wider mb-0.5">Nama Barang:</h2>
              <p className="text-base text-slate-700">{data.itemName || 'Tidak ada data'}</p>
            </div>

            <div className="mb-4"> 
              <h2 className="text-xs uppercase font-semibold text-slate-500 tracking-wider mb-0.5">Nama Pemilik:</h2>
              <p className="text-base text-slate-700">{data.ownerName || 'Tidak ada data'}</p>
            </div>

            <div className="mb-4"> 
              <h2 className="text-xs uppercase font-semibold text-slate-500 tracking-wider mb-0.5">Jenis Kerusakan:</h2>
              <p className="text-base text-slate-700 whitespace-pre-line">{data.damageType || 'Tidak ada data'}</p>
            </div>

            {data.warrantyPeriod && (
              <div>
                <h2 className="text-xs uppercase font-semibold text-slate-500 tracking-wider mb-0.5">Periode Garansi:</h2>
                <p className="text-base text-slate-700">{data.warrantyPeriod}</p>
              </div>
            )}
          </div>


          {/* Components Table */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-cyan-700 mb-2">Rincian Komponen & Jasa</h3>
            <div className="overflow-x-auto border border-slate-200 rounded-md">
              <table className="w-full min-w-[400px] text-sm">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="p-2.5 text-left text-xs uppercase font-semibold text-slate-600 tracking-wider w-10">No</th>
                    <th className="p-2.5 text-left text-xs uppercase font-semibold text-slate-600 tracking-wider">Nama Komponen</th>
                    <th className="p-2.5 text-center text-xs uppercase font-semibold text-slate-600 tracking-wider w-20">Jumlah</th>
                    <th className="p-2.5 text-right text-xs uppercase font-semibold text-slate-600 tracking-wider w-32">Harga</th>
                  </tr>
                </thead>
                <tbody>
                  {data.components.length > 0 ? data.components.map((item, index) => (
                    <tr key={item.id} className="border-b border-slate-200 last:border-b-0">
                      <td className="p-2.5 text-slate-700">{index + 1}</td>
                      <td className="p-2.5 text-slate-700">{item.name}</td>
                      <td className="p-2.5 text-center text-slate-700">{item.quantity}</td>
                      <td className="p-2.5 text-right text-slate-700">{formatCurrency(item.price)}</td>
                    </tr>
                  )) : (
                    <tr>
                        <td colSpan={4} className="p-4 text-center text-slate-500 italic">Tidak ada komponen.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals Section */}
          <div className="mt-6">
              <div className="space-y-1 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Subtotal Komponen:</span>
                  <span className="font-medium text-slate-700">{formatCurrency(subtotalComponents)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Biaya Jasa Servis:</span>
                  <span className="font-medium text-slate-700">{formatCurrency(data.serviceFee)}</span>
                </div>
                <div className="flex justify-between text-base font-semibold pt-2 mt-1 border-t border-slate-300">
                  <span className="text-cyan-700">Total Harga:</span>
                  <span className="text-cyan-700">{formatCurrency(grandTotal)}</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-cyan-50 border border-cyan-200 rounded-md text-sm text-cyan-800">
                <p className="font-semibold">Harap Simpan Nota Servis Barang Elektronik Ini!</p>
                <p>Jika hilang, garansi tidak berlaku.</p>
              </div>
          </div>
          
          {/* Footer */}
          <div className="mt-8 pt-4 border-t-2 border-cyan-500 text-xs text-slate-500">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex items-center">
                    <PhoneIcon className="w-3.5 h-3.5 mr-1.5 text-cyan-500 flex-shrink-0" />
                    <span>{CONTACT_PHONE}</span>
                </div>
                <div className="flex items-start text-right">
                    <LocationMarkerIcon className="w-3.5 h-3.5 mr-1.5 text-cyan-500 mt-0.5 flex-shrink-0" />
                    <div className="text-left sm:text-right">
                        {CONTACT_ADDRESS.split(', ').map((part, index) => (
                            <span key={index} className="block">{part}</span>
                        ))}
                    </div>
                </div>
            </div>
            <p className="text-center mt-3">&copy; {new Date().getFullYear()} {COMPANY_NAME}. All rights reserved.</p>
          </div>
        </div>
      );
    };

    export default InvoicePreview;