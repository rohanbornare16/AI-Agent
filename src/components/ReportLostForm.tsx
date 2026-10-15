import React, { useState } from 'react';
import {
  FilePlus,
  AlertCircle,
  CheckCircle2,
  Calendar,
  MapPin,
  Tag,
  Palette,
  Briefcase,
  ShieldAlert,
  Upload,
  User,
  Sparkles,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import { ItemCategory, ContactRole, ItemReport } from '../types';
import { CATEGORIES, CAMPUS_LOCATIONS, PRESET_COLORS } from '../utils/constants';

interface ReportLostFormProps {
  onSubmit: (report: Partial<ItemReport>) => Promise<ItemReport>;
  onSuccessNavigate: (createdId: string) => void;
}

export const ReportLostForm: React.FC<ReportLostFormProps> = ({
  onSubmit,
  onSuccessNavigate,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ItemCategory>('wallets_purses');
  const [color, setColor] = useState('Black');
  const [brand, setBrand] = useState('');
  const [location, setLocation] = useState('Central Library');
  const [customLocation, setCustomLocation] = useState('');
  const [date, setDate] = useState('2026-10-08');
  const [description, setDescription] = useState('');
  const [identifyingMarks, setIdentifyingMarks] = useState('');
  const [imageUri, setImageUri] = useState<string | undefined>(undefined);
  const [contactName, setContactName] = useState('Rohan Bornare');
  const [contactRole, setContactRole] = useState<ContactRole>('student');
  const [contactEmail, setContactEmail] = useState('rohan.b@campus.edu');
  const [contactPhone, setContactPhone] = useState('+1 (555) 012-3456');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successReport, setSuccessReport] = useState<ItemReport | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUri(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!title.trim()) errs.title = 'Item name or title is required.';
    if (!category) errs.category = 'Please select an item category.';
    const finalLoc = location === 'other' ? customLocation : location;
    if (!finalLoc.trim()) errs.location = 'Please specify the last-seen campus location.';
    if (!date) errs.date = 'Date lost is required.';
    if (!contactName.trim()) errs.contactName = 'Your name is required for campus claim records.';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const finalLoc = location === 'other' ? customLocation : location;
      const created = await onSubmit({
        type: 'lost',
        title: title.trim(),
        category,
        color,
        brand: brand.trim(),
        location: finalLoc.trim(),
        date,
        description: description.trim(),
        identifyingMarks: identifyingMarks.trim(),
        imageUri,
        contactName: contactName.trim(),
        contactRole,
        contactEmail: contactEmail.trim(),
        contactPhone: contactPhone.trim(),
      });

      setSuccessReport(created);
    } catch (err: any) {
      setErrors({ form: err.message || 'Submission failed. Please verify fields and try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successReport) {
    return (
      <div className="max-w-2xl mx-auto p-8 rounded-3xl bg-slate-900/90 border border-emerald-500/30 text-center space-y-6 shadow-2xl animate-fadeIn">
        <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-white">Lost Report Registered Successfully!</h2>
          <p className="text-sm text-slate-300">
            Case Reference: <span className="font-mono text-cyan-300 font-bold">{successReport.id}</span>
          </p>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Your report for <span className="text-white font-semibold">{successReport.title}</span> has been indexed into the campus retrieval database. The AI Matching Engine will continuously scan newly turned-in items.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => onSuccessNavigate(successReport.id)}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2"
          >
            <span>Scan Potential Matches Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setSuccessReport(null);
              setTitle('');
              setDescription('');
              setBrand('');
              setIdentifyingMarks('');
              setImageUri(undefined);
            }}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
          >
            File Another Report
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/20">
          <FilePlus className="w-3.5 h-3.5 text-rose-400" />
          <span>Official Campus Lost Property Log</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Report a Missing Item
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Provide accurate details to assist our AI Matching Engine and campus security in locating your belongings.
        </p>
      </div>

      {errors.form && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errors.form}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8">
        {/* Section 1: Item Identity */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5" />
            <span>1. Item Identification</span>
          </h2>

          {/* Item Name */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-200">
              Item Name / Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Black Leather Men's Wallet, Blue Milton Flask, Silver MacBook Pro"
              className={`w-full px-4 py-2.5 rounded-xl bg-slate-950 border ${
                errors.title ? 'border-rose-500' : 'border-slate-800 focus:border-cyan-400'
              } text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none transition`}
            />
            {errors.title && <p className="text-[11px] text-rose-400">{errors.title}</p>}
          </div>

          {/* Category & Color Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-200">
                Category <span className="text-rose-400">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ItemCategory)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-400 text-xs sm:text-sm text-white focus:outline-none transition"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-200">Primary Color</label>
              <select
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-400 text-xs sm:text-sm text-white focus:outline-none transition"
              >
                {PRESET_COLORS.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Brand */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-200">
              Brand / Manufacturer <span className="text-slate-400 text-[11px]">(Optional)</span>
            </label>
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="e.g. Tommy Hilfiger, Apple, Milton, Casio, Dell"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-400 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none transition"
            />
          </div>
        </div>

        {/* Section 2: Last-seen Location & Date */}
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <h2 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" />
            <span>2. Location & Date Details</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-200">
                Last-Seen Campus Location <span className="text-rose-400">*</span>
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-400 text-xs sm:text-sm text-white focus:outline-none transition"
              >
                {CAMPUS_LOCATIONS.map((loc) => (
                  <option key={loc.id} value={loc.name}>
                    {loc.name} ({loc.zone})
                  </option>
                ))}
                <option value="other">Other Campus Location (Type below)</option>
              </select>
              {location === 'other' && (
                <input
                  type="text"
                  value={customLocation}
                  onChange={(e) => setCustomLocation(e.target.value)}
                  placeholder="Specify exact room, hall or area"
                  className="mt-2 w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                />
              )}
              {errors.location && <p className="text-[11px] text-rose-400">{errors.location}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-200">
                Date Lost <span className="text-rose-400">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-400 text-xs sm:text-sm text-white focus:outline-none transition"
              />
              {errors.date && <p className="text-[11px] text-rose-400">{errors.date}</p>}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-200">Public Item Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe general appearance, wear & tear, case style, or what floor it was left on..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-400 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none transition"
            />
          </div>
        </div>

        {/* Section 3: Private Verification Safeguards */}
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>3. Confidential Ownership Verification</span>
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
              Not Displayed Publicly
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-800/40 text-xs text-amber-200/90 leading-relaxed">
            <p>
              <strong>Security Protocol:</strong> Specify unique details that only the genuine owner would know (e.g., lockscreen wallpaper, card initials, stickers, carved marks, or specific wallet contents). Campus security uses these to verify your identity before handing over the item.
            </p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-200">
              Unique Identifying Marks / Private Contents
            </label>
            <textarea
              rows={2}
              value={identifyingMarks}
              onChange={(e) => setIdentifyingMarks(e.target.value)}
              placeholder="e.g. Contains metro transit card ending in 492; small rocket sticker on bottom; initials carved inside lid."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-400 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none transition"
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-200 flex items-center gap-1">
              <Upload className="w-3.5 h-3.5 text-slate-400" />
              <span>Reference Image (Optional)</span>
            </label>
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="text-xs text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 cursor-pointer"
              />
              {imageUri && (
                <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-700 relative">
                  <img src={imageUri} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 4: Contact & Submitter Info */}
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <h2 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" />
            <span>4. Submitter Information</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-200">
                Full Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white focus:outline-none"
              />
              {errors.contactName && <p className="text-[11px] text-rose-400">{errors.contactName}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-200">Campus Role</label>
              <select
                value={contactRole}
                onChange={(e) => setContactRole(e.target.value as ContactRole)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white focus:outline-none"
              >
                <option value="student">Student</option>
                <option value="faculty">Faculty / Professor</option>
                <option value="staff">College Staff / Security</option>
                <option value="visitor">Campus Visitor</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-200">Campus Email</label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-200">Contact Phone</label>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-8 py-3 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white shadow-lg shadow-indigo-600/30 transition transform hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Registering Report...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-300" />
                <span>Submit Lost Report & Run Matcher</span>
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
