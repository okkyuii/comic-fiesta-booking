import React, { useState, useEffect } from 'react';
import { Camera, Calendar, Clock, User, MessageSquare, Phone, Sparkles, CheckCircle2, ChevronRight, Info } from 'lucide-react';

// Pre-defined Convention Dates (e.g., typical Comic Fiesta weekend)
const CONVENTION_DATES = [
    { id: 'day1', label: 'Day 1 - Saturday', date: '2026-12-19' },
    { id: 'day2', label: 'Day 2 - Sunday', date: '2026-12-20' }
];

// Available Time Slots by Date
const TIME_SLOTS_BY_DATE = {
    '2026-12-19': [
        '10:00 AM', '11:00 AM', '12:00 PM', 
        '01:00 PM', '02:00 PM', '03:00 PM', 
        '04:00 PM', '05:00 PM', '06:00 PM',
        '07:00 PM', '08:00 PM'
    ],
    '2026-12-20': [
        '10:00 AM', '11:00 AM', '12:00 PM'
    ]
};

export default function BookingApp() {
    const [bookings, setBookings] = useState(() => {
        try {
            const saved = localStorage.getItem('cf_bookings_2026');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });
    
    // Form & Selection State
    const [selectedDate, setSelectedDate] = useState(CONVENTION_DATES[0].date);
    const [selectedTime, setSelectedTime] = useState(null);
    const [formData, setFormData] = useState({
        clientName: '',
        character: '',
        series: '',
        contact: '',
        requests: ''
    });
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // --- EMAIL SETUP ---
    // Paste your Formspree endpoint URL below (from your Formspree dashboard)
    const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xkjrzdle';

    useEffect(() => {
        try {
            localStorage.setItem('cf_bookings_2026', JSON.stringify(bookings));
        } catch {
            // Ignore browser storage restrictions
        }
    }, [bookings]);

    // --- Handlers ---
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDateSelect = (date) => {
        setSelectedDate(date);
        setSelectedTime(null);
        setSubmitSuccess(false);
        setErrorMsg('');
    };

    const handleTimeSelect = (time) => {
        if (isSlotBooked(selectedDate, time)) return;
        setSelectedTime(time);
        setSubmitSuccess(false);
        setErrorMsg('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedDate || !selectedTime) {
            setErrorMsg("Please select a date and time.");
            return;
        }

        if (!formData.clientName || !formData.character || !formData.contact) {
            setErrorMsg("Please fill in all required fields.");
            return;
        }

        if (isSlotBooked(selectedDate, time)) {
            setErrorMsg("Sorry, this slot was just booked!");
            setSelectedTime(null);
            return;
        }

        setIsSubmitting(true);
        setErrorMsg('');

        try {
            const dateLabel = CONVENTION_DATES.find(d => d.date === selectedDate)?.label || selectedDate;
            const response = await fetch(FORMSPREE_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    _subject: `New Booking: ${formData.clientName} - ${dateLabel} @ ${selectedTime}`,
                    Client_Name: formData.clientName,
                    Date: dateLabel,
                    Time_Slot: selectedTime,
                    Character: formData.character,
                    Series: formData.series || 'N/A',
                    Contact_Info: formData.contact,
                    Special_Requests: formData.requests || 'None'
                })
            });

            if (!response.ok) {
                throw new Error('Formspree submission failed');
            }

            setBookings(prev => [...prev, { date: selectedDate, time: selectedTime }]);
            setSubmitSuccess(true);
            setFormData({
                clientName: '',
                character: '',
                series: '',
                contact: '',
                requests: ''
            });
            setSelectedTime(null);
        } catch (err) {
            console.error("Booking failed:", err);
            setErrorMsg("Failed to send booking. Please check your Formspree endpoint URL and try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- Helper ---
    const isSlotBooked = (date, time) => {
        return bookings.some(b => b.date === date && b.time === time);
    };

    return (
        <div className="min-h-screen bg-gray-950 text-gray-200 font-sans selection:bg-pink-500 selection:text-white pb-20">
            {/* Hero Section */}
            <header className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-purple-900 to-gray-950 pt-20 pb-16 border-b border-pink-900/30 shadow-2xl shadow-pink-900/20">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] [mask-image:linear-gradient(to_bottom,white,transparent)]"></div>
                <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
                    <div className="inline-flex items-center justify-center p-3 bg-pink-500/10 rounded-full mb-6 border border-pink-500/30 text-pink-400">
                        <Camera size={28} className="mr-2" />
                        <span className="text-sm font-bold tracking-widest uppercase">Comic Fiesta 2026</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 mb-6 drop-shadow-sm">
                        Cosplay Photography <br className="hidden md:block"/> Commission
                    </h1>
                    <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto font-light leading-relaxed">
                        Capture your character in stunning detail. Secure your 1-hour exclusive shooting slot during the convention weekend. Limited slots available!
                    </p>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 md:px-6 -mt-8 relative z-20">
                
                {/* Global Error Banner */}
                {errorMsg && (
                    <div className="bg-red-900/50 border border-red-500 text-red-200 p-4 rounded-xl mb-6 flex items-center shadow-lg backdrop-blur-sm">
                        <Info className="mr-3 flex-shrink-0" />
                        <p>{errorMsg}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Left Column: Selection */}
                    <div className="lg:col-span-7 space-y-6">
                        
                        {/* Step 1: Date Selection */}
                        <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                                <span className="bg-pink-500 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">1</span>
                                Select Date
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {CONVENTION_DATES.map((d) => (
                                    <button
                                        key={d.id}
                                        onClick={() => handleDateSelect(d.date)}
                                        className={`p-4 rounded-xl border text-left transition-all duration-200 ${
                                            selectedDate === d.date 
                                            ? 'border-pink-500 bg-pink-500/10 shadow-[0_0_15px_rgba(236,72,153,0.15)]' 
                                            : 'border-gray-700 bg-gray-800 hover:border-gray-500 hover:bg-gray-700'
                                        }`}
                                    >
                                        <div className="flex items-center text-gray-300 mb-1">
                                            <Calendar size={16} className={`mr-2 ${selectedDate === d.date ? 'text-pink-400' : 'text-gray-400'}`} />
                                            <span className="text-sm font-medium">{d.label}</span>
                                        </div>
                                        <div className={`text-lg font-bold ${selectedDate === d.date ? 'text-pink-300' : 'text-white'}`}>
                                            {new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* Step 2: Time Selection */}
                        <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                                <span className="bg-pink-500 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">2</span>
                                Select Time Slot
                            </h2>
                            
                            {!selectedDate ? (
                                <p className="text-gray-500 text-center py-8">Please select a date first.</p>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {(TIME_SLOTS_BY_DATE[selectedDate] || []).map((time) => {
                                        const isBooked = isSlotBooked(selectedDate, time);
                                        const isSelected = selectedTime === time;

                                        return (
                                            <button
                                                key={time}
                                                disabled={isBooked}
                                                onClick={() => handleTimeSelect(time)}
                                                className={`p-3 rounded-lg border flex flex-col items-center justify-center transition-all duration-200
                                                    ${isBooked 
                                                        ? 'opacity-50 cursor-not-allowed border-gray-800 bg-gray-950 text-gray-600' 
                                                        : isSelected 
                                                            ? 'border-purple-400 bg-purple-500/20 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                                                            : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-500 hover:bg-gray-700'
                                                    }
                                                `}
                                            >
                                                <Clock size={18} className="mb-1 opacity-70" />
                                                <span className="font-semibold">{time}</span>
                                                <span className="text-xs mt-1">
                                                    {isBooked ? 'Booked' : 'Available'}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </section>
                    </div>

                    {/* Right Column: Form */}
                    <div className="lg:col-span-5">
                        <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl sticky top-6">
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                                <span className="bg-pink-500 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">3</span>
                                Booking Details
                            </h2>

                            {submitSuccess ? (
                                <div className="text-center py-10">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-900/30 text-green-400 mb-4 border border-green-500/30">
                                        <CheckCircle2 size={32} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-2">Booking Confirmed!</h3>
                                    <p className="text-gray-400 mb-6">
                                        Your slot is secured. I will contact you shortly to discuss the shoot concepts.
                                    </p>
                                    <button 
                                        onClick={() => setSubmitSuccess(false)}
                                        className="text-pink-400 hover:text-pink-300 font-medium underline"
                                    >
                                        Book another slot
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    
                                    {/* Selection Summary */}
                                    <div className="bg-black/40 rounded-lg p-4 border border-gray-800 mb-6">
                                        <div className="text-sm text-gray-400 mb-1">Selected Slot:</div>
                                        {selectedDate && selectedTime ? (
                                            <div className="text-purple-300 font-semibold flex items-center">
                                                <Sparkles size={16} className="mr-2" />
                                                {CONVENTION_DATES.find(d => d.date === selectedDate)?.label} @ {selectedTime}
                                            </div>
                                        ) : (
                                            <div className="text-gray-600 italic">None selected yet</div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Client Name / Cosplayer Name *</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                                                <User size={18} />
                                            </div>
                                            <input 
                                                type="text" 
                                                name="clientName"
                                                value={formData.clientName}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full bg-gray-950 border border-gray-700 rounded-lg py-2.5 pl-10 pr-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                                                placeholder="John Doe (or stage name)"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-1">Character *</label>
                                            <input 
                                                type="text" 
                                                name="character"
                                                value={formData.character}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full bg-gray-950 border border-gray-700 rounded-lg py-2.5 px-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
                                                placeholder="e.g. Gojo Satoru"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-1">Series</label>
                                            <input 
                                                type="text" 
                                                name="series"
                                                value={formData.series}
                                                onChange={handleInputChange}
                                                className="w-full bg-gray-950 border border-gray-700 rounded-lg py-2.5 px-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
                                                placeholder="e.g. Jujutsu Kaisen"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Contact Info (Email/IG/WhatsApp) *</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                                                <Phone size={18} />
                                            </div>
                                            <input 
                                                type="text" 
                                                name="contact"
                                                value={formData.contact}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full bg-gray-950 border border-gray-700 rounded-lg py-2.5 pl-10 pr-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
                                                placeholder="@username or +601..."
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Special Requests / Ideas</label>
                                        <div className="relative">
                                            <div className="absolute top-3 left-3 pointer-events-none text-gray-500">
                                                <MessageSquare size={18} />
                                            </div>
                                            <textarea 
                                                name="requests"
                                                value={formData.requests}
                                                onChange={handleInputChange}
                                                rows="3"
                                                className="w-full bg-gray-950 border border-gray-700 rounded-lg py-2.5 pl-10 pr-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all resize-none"
                                                placeholder="Specific lighting, poses, props..."
                                            ></textarea>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={!selectedTime || isSubmitting}
                                        className={`w-full mt-4 flex items-center justify-center py-3.5 rounded-xl font-bold text-lg transition-all duration-300
                                            ${(!selectedTime || isSubmitting)
                                                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                                : 'bg-gradient-to-r from-pink-600 to-purple-600 text-white hover:from-pink-500 hover:to-purple-500 shadow-[0_0_20px_rgba(236,72,153,0.3)] hover:shadow-[0_0_25px_rgba(236,72,153,0.5)] scale-100 hover:scale-[1.02]'
                                            }
                                        `}
                                    >
                                        {isSubmitting ? (
                                            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>
                                        ) : (
                                            <>
                                                Confirm Booking
                                                <ChevronRight size={20} className="ml-2" />
                                            </>
                                        )}
                                    </button>
                                    
                                    {!selectedTime && (
                                        <p className="text-center text-sm text-gray-500 mt-2">
                                            Please select a time slot to continue
                                        </p>
                                    )}
                                </form>
                            )}
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}