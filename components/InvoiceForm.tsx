
import React, { useState, useEffect } from 'react';
    import { InvoiceDetails, ComponentItem } from '../types';
    import { PlusIcon, TrashIcon } from './Icons';

    interface InvoiceFormProps {
      onSubmit: (data: InvoiceDetails) => void;
      initialData?: Partial<InvoiceDetails>;
    }

    const todayDate = () => new Date().toISOString().split('T')[0];

    const InputField: React.FC<{label: string; id: string; type?: string; value: string | number; onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void; required?: boolean; placeholder?: string; rows?: number }> = 
    ({ label, id, type = "text", value, onChange, required = false, placeholder, rows }) => (
      <div>
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
        {type === 'textarea' ? (
          <textarea
            id={id}
            value={value as string}
            onChange={onChange}
            required={required}
            placeholder={placeholder}
            rows={rows || 3}
            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
          />
        ) : (
          <input
            type={type}
            id={id}
            value={value}
            onChange={onChange}
            required={required}
            placeholder={placeholder}
            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
          />
        )}
      </div>
    );


    const InvoiceForm: React.FC<InvoiceFormProps> = ({ onSubmit, initialData }) => {
      const [itemName, setItemName] = useState(initialData?.itemName || '');
      const [ownerName, setOwnerName] = useState(initialData?.ownerName || '');
      const [ownerPhone, setOwnerPhone] = useState(initialData?.ownerPhone || '');
      const [damageType, setDamageType] = useState(initialData?.damageType || '');
      const [invoiceDate, setInvoiceDate] = useState(initialData?.invoiceDate || todayDate());
      const [warrantyPeriod, setWarrantyPeriod] = useState(initialData?.warrantyPeriod || '1 Minggu');
      const [components, setComponents] = useState<ComponentItem[]>(initialData?.components || []);
      const [serviceFee, setServiceFee] = useState<string>(initialData?.serviceFee?.toString() || '0');

      useEffect(() => {
        if (initialData) {
            setItemName(initialData.itemName || '');
            setOwnerName(initialData.ownerName || '');
            setOwnerPhone(initialData.ownerPhone || '');
            setDamageType(initialData.damageType || '');
            setInvoiceDate(initialData.invoiceDate || todayDate());
            setWarrantyPeriod(initialData.warrantyPeriod || '1 Minggu');
            setComponents(initialData.components || []);
            setServiceFee(initialData.serviceFee?.toString() || '0');
        }
      }, [initialData]);
      
      const handleAddComponent = () => {
        setComponents([...components, { id: crypto.randomUUID(), name: '', quantity: 1, price: 0 }]);
      };

      const handleRemoveComponent = (id: string) => {
        setComponents(components.filter(comp => comp.id !== id));
      };

      const handleComponentChange = <K extends keyof ComponentItem>(id: string, field: K, value: ComponentItem[K]) => {
        setComponents(components.map(comp => 
          comp.id === id ? { ...comp, [field]: value } : comp
        ));
      };

      const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
          itemName,
          ownerName,
          ownerPhone,
          damageType,
          invoiceDate,
          warrantyPeriod,
          components,
          serviceFee: parseFloat(serviceFee) || 0,
        });
      };

      return (
        <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-white shadow-xl rounded-lg">
          <h2 className="text-2xl font-semibold text-cyan-700 border-b pb-3">Detail Servis</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField label="Nama Barang" id="itemName" value={itemName} onChange={e => setItemName(e.target.value)} required placeholder="e.g., Timbangan Digital 40kg" />
            <InputField label="Nama Pemilik" id="ownerName" value={ownerName} onChange={e => setOwnerName(e.target.value)} required placeholder="e.g., Nadia Indah" />
          </div>
           <InputField label="Nomor HP Pemilik (WhatsApp)" id="ownerPhone" type="tel" value={ownerPhone} onChange={e => setOwnerPhone(e.target.value)} placeholder="e.g., 081234567890 atau 6281234567890" />
          
          <InputField label="Jenis Kerusakan" id="damageType" type="textarea" value={damageType} onChange={e => setDamageType(e.target.value)} required placeholder="e.g., Rusak bagian load cell" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField label="Tanggal Struk" id="invoiceDate" type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} required />
            <InputField label="Periode Garansi" id="warrantyPeriod" value={warrantyPeriod} onChange={e => setWarrantyPeriod(e.target.value)} required placeholder="e.g., 1 Minggu, 1 Bulan" />
          </div>

          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-cyan-700 border-b pb-2">Komponen & Biaya</h3>
            {components.map((comp, index) => (
              <div key={comp.id} className="grid grid-cols-12 gap-x-3 gap-y-3 items-center p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
                <span className="col-span-1 self-center text-center text-sm text-slate-500 font-medium hidden md:block">{index + 1}.</span>
                <div className="col-span-12 md:col-span-5">
                  <label htmlFor={`compName-${comp.id}`} className="sr-only">Nama Komponen</label>
                  <input
                    id={`compName-${comp.id}`}
                    type="text"
                    placeholder="Nama Komponen"
                    value={comp.name}
                    onChange={e => handleComponentChange(comp.id, 'name', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                    required
                  />
                </div>
                <div className="col-span-4 md:col-span-2">
                   <label htmlFor={`compQty-${comp.id}`} className="sr-only">Jumlah</label>
                  <input
                    id={`compQty-${comp.id}`}
                    type="number"
                    placeholder="Jumlah"
                    value={comp.quantity}
                    min="1"
                    onChange={e => handleComponentChange(comp.id, 'quantity', parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm text-slate-900 placeholder-slate-400 text-center focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                    required
                  />
                </div>
                <div className="col-span-5 md:col-span-3">
                   <label htmlFor={`compPrice-${comp.id}`} className="sr-only">Harga</label>
                   <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-sm text-slate-500 pointer-events-none">Rp</span>
                        <input
                        id={`compPrice-${comp.id}`}
                        type="number"
                        placeholder="Harga"
                        value={comp.price}
                        min="0"
                        step="1000"
                        onChange={e => handleComponentChange(comp.id, 'price', parseFloat(e.target.value) || 0)}
                        className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-md text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                        required
                        />
                    </div>
                </div>
                <div className="col-span-3 md:col-span-1 flex justify-end items-center">
                  <button 
                    type="button" 
                    onClick={() => handleRemoveComponent(comp.id)} 
                    className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 transition-colors"
                    aria-label="Hapus komponen"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
            <button 
              type="button" 
              onClick={handleAddComponent} 
              className="flex items-center justify-center w-full text-sm text-cyan-600 hover:text-cyan-800 border-2 border-dashed border-cyan-300 hover:border-cyan-500 bg-white hover:bg-cyan-50 py-2.5 px-4 rounded-md transition focus:outline-none focus:ring-2 focus:ring-cyan-400"
            >
              <PlusIcon className="w-5 h-5 mr-2" /> Tambah Komponen
            </button>
          </div>
          
          <InputField label="Biaya Jasa Servis (Rp)" id="serviceFee" type="number" value={serviceFee} onChange={e => setServiceFee(e.target.value)} required placeholder="e.g., 20000" />

          <button 
            type="submit" 
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-50"
          >
            Buat Struk
          </button>
        </form>
      );
    };

    export default InvoiceForm;
    