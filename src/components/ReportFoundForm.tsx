import React, { useState } from 'react';
import {
  PackageCheck,
  AlertCircle,
  CheckCircle2,
  MapPin,
  Tag,
  ShieldCheck,
  Upload,
  User,
  Sparkles,
  ArrowRight,
  Shield,
  Building,
} from 'lucide-react';
import { ItemCategory, ContactRole, ItemReport } from '../types';
import { CATEGORIES, CAMPUS_LOCATIONS, PRESET_COLORS, DROP_OFF_LOCATIONS } from '../utils/constants';

interface ReportFoundFormProps {
  onSubmit: (report: Partial<ItemReport>) => Promise<ItemReport>;
  onSuccessNavigate: (createdId: string) => void;
}

export const ReportFoundForm: React.FC<ReportFoundFormProps> = ({
  onSubmit,
  onSuccessNavigate,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ItemCategory>('wallets_purses');
  const [color, setColor] = useState('Black');
  const [brand, setBrand] = useState('');
  const [location, setLocation] = useState('Central Library');
  const [customLocation, setCustomLocation] = useState('');
  const [dropOffLocation, setDropOffLocation] = useState(DROP_OFF_LOCATIONS[0]);
  const [date, setDate] = useState('2026-10-09');
  const [description, setDescription] = useState('');
  const [verificationQuestions, setVerificationQuestions] = useState('');
  const [imageUri, setImageUri] = useState<string | undefined>(undefined);
  const [contactName, setContactName] = useState('Ms. Sunita Patel (Librarian)');
  const [contactRole, setContactRole] = useState<ContactRole>('staff');
  const [contactEmail, setContactEmail] = useState('library.desk@campus.edu');

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
    if (!title.trim()) errs.title = 'Found item title is required.';
    if (!category) errs.category = 'Please select a category.';
    const finalLoc = location === 'other' ? customLocation : location;
    if (!finalLoc.trim()) errs.location = 'Please select where you discovered the item.';
    if (!date) errs.date = 'Date found is required.';
    if (!contactName.trim()) errs.contactName = 'Finder / custodian name is required.';

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
        type: 'found',
        title: title.trim(),
        category,
        color,
        brand: brand.trim(),
        location: finalLoc.trim(),
        dropOffLocation,
        date,
        description: description.trim(),
        identifyingMarks: verificationQuestions.trim(),
        imageUri,
        contactName: contactName.trim(),
        contactRole,
        contactEmail: contactEmail.trim(),
      });

      setSuccessReport(created);
    } catch (err: any) {
      setErrors({ form: err.message || 'Submission failed. Please check inputs.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successReport) {
    return (
      <div className="max-w-2xl mx-auto p-8 rounded-3xl bg-slate-900/90 border border-cyan-500/30 text-center space-y-6 shadow-2xl animate-fadeIn">
        <div className="w-16 h-16 mx-auto rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-white">Found Item Registered in Security Custody!</h2>
          <p className="text-sm text-slate-300">
            Reference ID: <span className="font-mono text-cyan-300 font-bold">{successReport.id}</span>
          </p>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Item <span className="text-white font-semibold">{successReport.title}</span> logged at{' '}
            <span className="text-cyan-300 font-semibold">{successReport.dropOffLocation}</span>.
            The matching system has alerted relevant lost item reports.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => onSuccessNavigate(successReport.id)}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-lg shadow-cyan-600/30 transition flex items-center justify-center gap-2"
          >
            <span>View Potential Owner Matches</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setSuccessReport(null);
              setTitle('');
              setDescription('');
              setBrand('');
              setVerificationQuestions('');
              setImageUri(undefined);
            }}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
          >
            Log Another Found Item
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
          <PackageCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span>Found Item Registration & Custody Desk</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Report a Found Item
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Turned in a misplaced item on campus? Help reunite it with its rightful owner while protecting security.
        </p>
      </div>

      {/* Safety Notice regarding sensitive items */}
      <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-800/40 text-xs text-indigo-200 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="text-white">Campus Privacy & Safety Rule:</strong>
          <p>
            Do not publish sensitive identifying details (such as full national identity numbers, passwords, lockscreen pins, or exact cash amounts). Keep those details for authorized ownership verification.
          </p>
        </div>
      </div>

      {errors.form && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errors.form}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8">
        {/* Section 1: Item Overview */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5" />
            <span>1. General Item Overview</span>
          </h2>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-200">
              Item Title / General Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Black Leather Wallet, Blue Insulated Water Bottle, College ID Card"
              className={`w-full px-4 py-2.5 rounded-xl bg-slate-950 border ${
                errors.title ? 'border-rose-500' : 'border-slate-800 focus:border-cyan-400'
              } text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none transition`}
            />
            {errors.title && <p className="text-[11px] text-rose-400">{errors.title}</p>}
          </div>

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

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-200">
              Brand / Make <span className="text-slate-400 text-[11px]">(If visible)</span>
            </label>
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="e.g. Tommy Hilfiger, Milton, Casio, Apple, Fastrack"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-400 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none transition"
            />
          </div>
        </div>

        {/* Section 2: Discovery Location & Safe Custody */}
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <h2 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" />
            <span>2. Where Found & Physical Storage</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-200">
                Location Found <span className="text-rose-400">*</span>
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
                <option value="other">Other Location</option>
              </select>
              {location === 'other' && (
                <input
                  type="text"
                  value={customLocation}
                  onChange={(e) => setCustomLocation(e.target.value)}
                  placeholder="Specify exact spot"
                  className="mt-2 w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                />
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-200">
                Date Discovered <span className="text-rose-400">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-400 text-xs sm:text-sm text-white focus:outline-none transition"
              />
            </div>
          </div>

          {/* Custody Drop-off Point */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-cyan-400" />
              <span>Campus Custody Drop-off Point</span>
            </label>
            <select
              value={dropOffLocation}
              onChange={(e) => setDropOffLocation(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-400 text-xs sm:text-sm text-white focus:outline-none transition"
            >
              {DROP_OFF_LOCATIONS.map((point) => (
                <option key={point} value={point}>
                  {point}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400">
              Physical items must be deposited at this location for official claimant verification.
            </p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-200">Public Item Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Found on table 14 near the reference section during evening closing rounds. Good condition."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-400 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none transition"
            />
          </div>
        </div>

        {/* Section 3: Verification Questions (Private) */}
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              <span>3. Secret Ownership Verification Test</span>
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
              Security Use Only
            </span>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-200">
              What question should Security ask the claimant?
            </label>
            <textarea
              rows={2}
              value={verificationQuestions}
              onChange={(e) => setVerificationQuestions(e.target.value)}
              placeholder="e.g. Ask claimant to state the color of the keychain inside, or describe the specific sticker on the lid."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-400 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none transition"
            />
          </div>

          {/* Optional Photo */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-200 flex items-center gap-1">
              <Upload className="w-3.5 h-3.5 text-slate-400" />
              <span>Photo of Item (Optional)</span>
            </label>
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="text-xs text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 cursor-pointer"
              />
              {imageUri && (
                <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-700">
                  <img src={imageUri} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 4: Finder / Staff Info */}
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <h2 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" />
            <span>4. Custodian / Finder Information</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-200">
                Logged By <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-200">Campus Role</label>
              <select
                value={contactRole}
                onChange={(e) => setContactRole(e.target.value as ContactRole)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white focus:outline-none"
              >
                <option value="staff">Staff / Librarian / Security</option>
                <option value="faculty">Faculty Member</option>
                <option value="student">Student</option>
                <option value="visitor">Visitor</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-8 py-3 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-cyan-600 via-teal-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-lg shadow-cyan-600/30 transition transform hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Logging Found Item...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-300" />
                <span>Submit Found Report & Check Matches</span>
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
