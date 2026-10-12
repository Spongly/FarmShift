import React, { useState, useRef } from 'react';
import {
  Github,
  Mail,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  MessageSquare,
  Users,
  Globe,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type FormStatus = 'idle' | 'loading' | 'success' | 'error';

interface FormFields {
  name: string;
  email: string;
  role: string;
  subject: string;
  message: string;
}

const INITIAL_FIELDS: FormFields = {
  name: '',
  email: '',
  role: '',
  subject: '',
  message: '',
};

const MAX_MESSAGE_LENGTH = 1500;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ContactView() {
  const { state } = useApp();
  const { language } = state;
  const ne = language === 'ne';

  const [fields, setFields] = useState<FormFields>(INITIAL_FIELDS);
  const [errors, setErrors] = useState<Partial<FormFields>>({});
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const honeypotRef = useRef<HTMLInputElement>(null);

  // ---- i18n strings -------------------------------------------------------

  const copy = {
    eyebrow: ne ? 'सम्पर्क गर्नुहोस्' : 'GET IN TOUCH',
    heading: ne
      ? 'खेतीलाई अझ बुद्धिमानी बनाऔँ।'
      : "Let's make farming more informed.",
    subheading: ne
      ? 'फार्मसिफ्ट नेपाल एक खुला कृषि सूचना सेवा हो। यदि तपाईंसँग प्रश्नहरू छन्, सुझाव दिन चाहनुहुन्छ, वा सहकार्य गर्न रुचि राख्नुहुन्छ भने हामीलाई सम्पर्क गर्नुहोस्।'
      : "FarmShift Nepal is an open agricultural information service. If you have questions, suggestions, or want to collaborate on making evidence-based farming tools more accessible across Nepal, we'd love to hear from you.",

    formTitle: ne ? 'सन्देश पठाउनुहोस्' : 'Send a Message',
    nameLabel: ne ? 'पूरा नाम' : 'Full Name',
    namePlaceholder: ne ? 'तपाईंको नाम' : 'Your full name',
    emailLabel: ne ? 'इमेल ठेगाना' : 'Email Address',
    emailPlaceholder: ne ? 'you@example.com' : 'you@example.com',
    roleLabel: ne ? 'म एक हुँ...' : 'I am a...',
    rolePlaceholder: ne ? 'भूमिका छान्नुहोस्' : 'Select your role',
    subjectLabel: ne ? 'विषय' : 'Subject',
    subjectPlaceholder: ne
      ? 'तपाईंको सन्देशको विषय'
      : 'What is your message about?',
    messageLabel: ne ? 'सन्देश' : 'Message',
    messagePlaceholder: ne
      ? 'तपाईंको सुझाव, प्रश्न वा प्रतिक्रिया यहाँ लेख्नुहोस्...'
      : 'Write your message, question, or feedback here...',
    submitLabel: ne ? 'सन्देश पठाउनुहोस्' : 'Send Message',
    sendingLabel: ne ? 'पठाइँदैछ...' : 'Sending...',

    successHeading: ne ? 'सन्देश सफलतापूर्वक पठाइयो!' : 'Message sent!',
    successBody: ne
      ? 'धन्यवाद! हामी छिट्टै तपाईंलाई जवाफ दिनेछौँ।'
      : "Thank you for reaching out. We'll get back to you as soon as possible.",
    sendAnother: ne ? 'अर्को सन्देश पठाउनुहोस्' : 'Send another message',

    errorHeading: ne ? 'सन्देश पठाउन सकिएन।' : 'Failed to send.',
    retryLabel: ne ? 'पुनः प्रयास गर्नुहोस्' : 'Try again',

    required: ne ? 'आवश्यक' : 'Required',
    nameRequired: ne ? 'नाम आवश्यक छ।' : 'Name is required.',
    emailRequired: ne ? 'इमेल आवश्यक छ।' : 'Email address is required.',
    emailInvalid: ne ? 'मान्य इमेल ठेगाना लेख्नुहोस्।' : 'Enter a valid email address.',
    roleRequired: ne ? 'भूमिका छान्नुहोस्।' : 'Please select your role.',
    subjectRequired: ne ? 'विषय आवश्यक छ।' : 'Subject is required.',
    messageRequired: ne ? 'सन्देश आवश्यक छ।' : 'Message is required.',

    infoTitle: ne ? 'सम्पर्क जानकारी' : 'Contact Information',
    githubLabel: ne ? 'स्रोत कोड' : 'Source Code',
    websiteLabel: ne ? 'लाइभ साइट' : 'Live Site',

    collabTitle: ne
      ? 'साथमा राम्रो कृषि उपकरणहरू बनाऔँ।'
      : 'Building better agricultural tools, together.',
    collabBody: ne
      ? 'फार्मसिफ्ट नेपाल एक खुला स्रोत परियोजना हो। GitHub मा कोड हेर्नुहोस्, issue खोल्नुहोस्, वा pull request पठाउनुहोस्।'
      : 'FarmShift Nepal is an open-source project. Explore the code, open an issue, or submit a pull request on GitHub. Contributions that improve crop data, regional coverage, or accessibility are especially welcome.',
    viewOnGithub: ne ? 'GitHub मा हेर्नुहोस्' : 'View on GitHub',
  };

  const roleOptions = ne
    ? [
        { value: 'farmer', label: 'किसान' },
        { value: 'student', label: 'विद्यार्थी' },
        { value: 'researcher', label: 'शोधकर्ता' },
        { value: 'agricultural-professional', label: 'कृषि पेशाकर्मी' },
        { value: 'organization', label: 'संस्था / NGO' },
        { value: 'developer', label: 'सफ्टवेयर डेभलपर' },
        { value: 'other', label: 'अन्य' },
      ]
    : [
        { value: 'farmer', label: 'Farmer' },
        { value: 'student', label: 'Student' },
        { value: 'researcher', label: 'Researcher / Academic' },
        { value: 'agricultural-professional', label: 'Agricultural Professional' },
        { value: 'organization', label: 'Organization / NGO' },
        { value: 'developer', label: 'Software Developer' },
        { value: 'other', label: 'Other' },
      ];

  // ---- Validation ---------------------------------------------------------

  function validate(): Partial<FormFields> {
    const errs: Partial<FormFields> = {};
    if (!fields.name.trim()) errs.name = copy.nameRequired;
    if (!fields.email.trim()) errs.email = copy.emailRequired;
    else if (!isValidEmail(fields.email)) errs.email = copy.emailInvalid;
    if (!fields.role) errs.role = copy.roleRequired;
    if (!fields.subject.trim()) errs.subject = copy.subjectRequired;
    if (!fields.message.trim()) errs.message = copy.messageRequired;
    return errs;
  }

  // ---- Submission ---------------------------------------------------------

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Honeypot — abort silently if bot filled it
    if (honeypotRef.current?.value) return;

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setStatus('loading');

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          access_key: import.meta.env.VITE_WEB3FORMS_KEY ?? '',
          name: fields.name.trim(),
          email: fields.email.trim(),
          role: fields.role,
          subject: fields.subject.trim(),
          message: fields.message.trim(),
          botcheck: '',
        }),
      });

      const data: { success: boolean; message?: string } = await res.json();
      if (!data.success) throw new Error(data.message ?? 'Submission failed');
      setStatus('success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setErrorMsg(msg);
      setStatus('error');
    }
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setFields(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormFields]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  }

  function resetForm() {
    setFields(INITIAL_FIELDS);
    setErrors({});
    setStatus('idle');
    setErrorMsg('');
  }

  // ---- Shared class helpers -----------------------------------------------

  const inputBase =
    'w-full px-3 py-2.5 text-sm border rounded bg-white text-ink placeholder:text-stone-400 outline-none transition-colors focus:border-forest-600 focus:ring-1 focus:ring-forest-600/30';
  const inputError = 'border-red-400 focus:border-red-500 focus:ring-red-400/30';
  const inputNormal = 'border-stone-300 hover:border-stone-400';

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div className="space-y-16 pb-16">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="pt-8 pb-4 border-b border-stone-200">
        <p className="text-2xs font-bold uppercase tracking-widest text-forest-700 mb-3">
          {copy.eyebrow}
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-ink leading-tight max-w-2xl">
          {copy.heading}
        </h1>
        <p className="mt-3 text-sm sm:text-base text-ink-secondary max-w-2xl leading-relaxed">
          {copy.subheading}
        </p>
      </section>

      {/* ── Two-column layout: Form + Sidebar ─────────────────────────────── */}
      <section className="grid lg:grid-cols-3 gap-10 lg:gap-16">

        {/* ── Contact Form ───────────────────────────────────────────── */}
        <div className="lg:col-span-2">
          <h2 className="text-base font-bold text-ink mb-6 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-forest-600" />
            {copy.formTitle}
          </h2>

          {/* ─── Success State ─── */}
          {status === 'success' && (
            <div className="bg-forest-50 border border-forest-200 rounded-lg p-6 flex flex-col items-start gap-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-forest-700 shrink-0" />
                <div>
                  <p className="font-bold text-forest-800 text-sm">{copy.successHeading}</p>
                  <p className="text-xs text-forest-700 mt-0.5">{copy.successBody}</p>
                </div>
              </div>
              <button
                onClick={resetForm}
                className="text-xs font-semibold text-forest-800 underline underline-offset-2 hover:text-forest-900"
              >
                {copy.sendAnother}
              </button>
            </div>
          )}

          {/* ─── Error Banner ─── */}
          {status === 'error' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-700">{copy.errorHeading}</p>
                {errorMsg && (
                  <p className="text-xs text-red-600 mt-0.5">{errorMsg}</p>
                )}
              </div>
              <button
                onClick={() => setStatus('idle')}
                className="text-xs font-semibold text-red-700 underline hover:text-red-900 shrink-0"
              >
                {copy.retryLabel}
              </button>
            </div>
          )}

          {/* ─── Form ─── */}
          {status !== 'success' && (
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {/* Honeypot anti-spam field — must stay hidden */}
              <input
                type="checkbox"
                name="botcheck"
                ref={honeypotRef}
                className="hidden"
                tabIndex={-1}
                aria-hidden="true"
              />

              {/* Name + Email row */}
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="contact-name" className="block text-xs font-semibold text-ink mb-1.5">
                    {copy.nameLabel} <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    placeholder={copy.namePlaceholder}
                    value={fields.name}
                    onChange={handleChange}
                    disabled={status === 'loading'}
                    className={`${inputBase} ${errors.name ? inputError : inputNormal}`}
                  />
                  {errors.name && (
                    <p className="text-2xs text-red-600 mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="contact-email" className="block text-xs font-semibold text-ink mb-1.5">
                    {copy.emailLabel} <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder={copy.emailPlaceholder}
                    value={fields.email}
                    onChange={handleChange}
                    disabled={status === 'loading'}
                    className={`${inputBase} ${errors.email ? inputError : inputNormal}`}
                  />
                  {errors.email && (
                    <p className="text-2xs text-red-600 mt-1">{errors.email}</p>
                  )}
                </div>
              </div>

              {/* Role */}
              <div>
                <label htmlFor="contact-role" className="block text-xs font-semibold text-ink mb-1.5">
                  {copy.roleLabel} <span className="text-red-500">*</span>
                </label>
                <select
                  id="contact-role"
                  name="role"
                  value={fields.role}
                  onChange={handleChange}
                  disabled={status === 'loading'}
                  className={`${inputBase} ${errors.role ? inputError : inputNormal} cursor-pointer`}
                >
                  <option value="">{copy.rolePlaceholder}</option>
                  {roleOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {errors.role && (
                  <p className="text-2xs text-red-600 mt-1">{errors.role}</p>
                )}
              </div>

              {/* Subject */}
              <div>
                <label htmlFor="contact-subject" className="block text-xs font-semibold text-ink mb-1.5">
                  {copy.subjectLabel} <span className="text-red-500">*</span>
                </label>
                <input
                  id="contact-subject"
                  name="subject"
                  type="text"
                  placeholder={copy.subjectPlaceholder}
                  value={fields.subject}
                  onChange={handleChange}
                  disabled={status === 'loading'}
                  className={`${inputBase} ${errors.subject ? inputError : inputNormal}`}
                />
                {errors.subject && (
                  <p className="text-2xs text-red-600 mt-1">{errors.subject}</p>
                )}
              </div>

              {/* Message */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="contact-message" className="block text-xs font-semibold text-ink">
                    {copy.messageLabel} <span className="text-red-500">*</span>
                  </label>
                  <span className="text-2xs text-ink-muted">
                    {fields.message.length}/{MAX_MESSAGE_LENGTH}
                  </span>
                </div>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={7}
                  maxLength={MAX_MESSAGE_LENGTH}
                  placeholder={copy.messagePlaceholder}
                  value={fields.message}
                  onChange={handleChange}
                  disabled={status === 'loading'}
                  className={`${inputBase} resize-y min-h-[120px] ${errors.message ? inputError : inputNormal}`}
                />
                {errors.message && (
                  <p className="text-2xs text-red-600 mt-1">{errors.message}</p>
                )}
              </div>

              {/* Submit */}
              <div className="pt-1">
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded bg-forest-700 hover:bg-forest-800 active:bg-forest-900 text-white font-bold text-sm shadow-xs transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {status === 'loading' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{copy.sendingLabel}</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>{copy.submitLabel}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* ── Sidebar ────────────────────────────────────────────────── */}
        <aside className="space-y-8">

          {/* Contact Info */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-ink mb-4">
              {copy.infoTitle}
            </h3>
            <ul className="space-y-4">
              <li>
                <a
                  href="https://github.com/Spongly/FarmShift"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 group"
                >
                  <div className="w-9 h-9 rounded bg-stone-100 border border-stone-200 flex items-center justify-center shrink-0 group-hover:border-forest-400 transition-colors">
                    <Github className="w-4 h-4 text-ink-secondary group-hover:text-forest-700 transition-colors" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-ink group-hover:text-forest-800 transition-colors">
                      {copy.githubLabel}
                    </p>
                    <p className="text-2xs text-ink-muted break-all">
                      github.com/Spongly/FarmShift
                    </p>
                  </div>
                </a>
              </li>

              <li>
                <a
                  href="https://farmshift.pokhrelpratik.com.np/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 group"
                >
                  <div className="w-9 h-9 rounded bg-stone-100 border border-stone-200 flex items-center justify-center shrink-0 group-hover:border-forest-400 transition-colors">
                    <Globe className="w-4 h-4 text-ink-secondary group-hover:text-forest-700 transition-colors" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-ink group-hover:text-forest-800 transition-colors">
                      {copy.websiteLabel}
                    </p>
                    <p className="text-2xs text-ink-muted break-all">
                      farmshift.pokhrelpratik.com.np
                    </p>
                  </div>
                </a>
              </li>

              <li>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded bg-stone-100 border border-stone-200 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-ink-muted" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-ink">
                      {ne ? 'इमेल' : 'Email'}
                    </p>
                    <p className="text-2xs text-ink-muted leading-relaxed">
                      {ne
                        ? 'माथिको फाराम मार्फत सम्पर्क गर्नुहोस्।'
                        : 'Use the form to reach us directly.'}
                    </p>
                  </div>
                </div>
              </li>
            </ul>
          </div>

          {/* Divider */}
          <hr className="border-stone-200" />

          {/* Context note */}
          <div className="text-2xs text-ink-muted space-y-2 leading-relaxed">
            <p className="flex items-center gap-1.5 font-semibold text-ink-secondary uppercase tracking-wide text-2xs">
              <Users className="w-3 h-3" />
              {ne ? 'परियोजनाको बारेमा' : 'About the Project'}
            </p>
            <p>
              {ne
                ? 'यो परियोजना NASA Space Apps Challenge 2026 को लागि बनाइएको हो — "Field Shift: Adapting Farms with NASA Data" थिम अन्तर्गत।'
                : 'Built for NASA Space Apps Challenge 2026 under the "Field Shift: Adapting Farms with NASA Data" theme.'}
            </p>
            <p>
              {ne
                ? 'यो एक विद्यार्थी-नेतृत्व परियोजना हो। प्रतिक्रियाहरू स्वागत छन्।'
                : 'This is a student-led open-source project. Feedback from farmers, researchers, and developers is warmly welcome.'}
            </p>
          </div>
        </aside>
      </section>

      {/* ── Collaboration CTA ──────────────────────────────────────────────── */}
      <section className="border border-stone-200 rounded-lg p-8 bg-stone-50">
        <div className="max-w-2xl">
          <h2 className="text-xl font-bold text-ink leading-snug">
            {copy.collabTitle}
          </h2>
          <p className="mt-2 text-sm text-ink-secondary leading-relaxed">
            {copy.collabBody}
          </p>
          <a
            href="https://github.com/Spongly/FarmShift"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded border border-stone-300 bg-white hover:border-forest-500 hover:text-forest-800 text-sm font-semibold text-ink transition-colors shadow-xs"
          >
            <Github className="w-4 h-4" />
            <span>{copy.viewOnGithub}</span>
            <ExternalLink className="w-3.5 h-3.5 text-ink-muted" />
          </a>
        </div>
      </section>

    </div>
  );
}
