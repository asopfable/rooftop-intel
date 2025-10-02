import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
} from "firebase/auth";
import { 
    getFirestore, 
    collection, 
    addDoc,
    serverTimestamp 
} from "firebase/firestore";

// --- Firebase Configuration ---
// These global variables will be provided in the execution environment.
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : { apiKey: "...", authDomain: "...", projectId: "...", storageBucket: "...", messagingSenderId: "...", appId: "..." };
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// --- Initialize Firebase ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- SVG Icons ---
const WindIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-blue-500"><path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"></path><path d="M9.6 4.6A2 2 0 1 1 11 8H2"></path><path d="M12.6 19.4A2 2 0 1 0 14 16H2"></path></svg>;
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-green-500 mr-3 flex-shrink-0"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const BookOpenIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-blue-500 mb-2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>;
const CalendarPlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-blue-500 mb-2"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect><line x1="16" x2="16" y1="2" y2="6"></line><line x1="8" x2="8" y1="2" y2="6"></line><line x1="3" x2="21" y1="10" y2="10"></line><line x1="12" x2="12" y1="14" y2="20"></line><line x1="9" x2="15" y1="17" y2="17"></line></svg>;
const LoaderIcon = () => <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;

// --- Helper Components ---
const ErrorMessage = ({ message }) => {
    if (!message) return null;
    return <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">{message}</div>;
};

const SuccessMessage = ({ message }) => {
    if (!message) return null;
    return <div className="p-3 mb-4 text-sm text-green-700 bg-green-100 rounded-lg" role="alert">{message}</div>;
};

const ResourceCard = ({ title, content, images = [] }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-4">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-5 font-medium text-left text-gray-800"
            >
                <span>{title}</span>
                <svg className={`w-6 h-6 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            {isOpen && (
                <div className="p-5 border-t border-gray-200">
                    <p className="text-gray-600 whitespace-pre-line mb-6">{content}</p>
                    {images.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {images.map((image, index) => (
                                <div key={index} className="border rounded-lg overflow-hidden">
                                    <img src={image.src} alt={image.caption} className="w-full h-48 object-cover" />
                                    <p className="text-sm text-gray-600 p-2 bg-gray-50 text-center">{image.caption}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// --- Authentication Components ---
const AuthForm = ({ isLogin, setAuthError }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setAuthError('');
        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
            }
        } catch (error) {
            setAuthError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
                <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
            </div>
            <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength="6"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
            </div>
            <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
            >
                {loading ? <LoaderIcon /> : (isLogin ? 'Log In' : 'Create Account')}
            </button>
        </form>
    );
};

// --- Logged-out View ---
const LandingPage = () => {
    const [isLoginView, setIsLoginView] = useState(true);
    const [authError, setAuthError] = useState('');
    
    return (
        <div>
             {/* Hero Section */}
            <section className="bg-gray-800 text-white" style={{backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('https://placehold.co/1200x800/4a5568/ffffff?text=HVAC+Unit+on+Rooftop')", backgroundSize: 'cover', backgroundPosition: 'center'}}>
                <div className="container mx-auto px-6 py-20 md:py-28 grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">Stop Guessing About HVAC/R. Get The Facts.</h1>
                        <p className="text-lg md:text-xl text-gray-200 mb-8">Create a free account to access DIY HVAC & Refrigeration assessment guides or schedule an expert remote inspection.</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-xl p-8 text-gray-900">
                        <div className="flex border-b border-gray-200 mb-6">
                            <button onClick={() => {setIsLoginView(true); setAuthError('')}} className={`flex-1 py-3 text-center font-semibold ${isLoginView ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>Log In</button>
                            <button onClick={() => {setIsLoginView(false); setAuthError('')}} className={`flex-1 py-3 text-center font-semibold ${!isLoginView ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>Sign Up</button>
                        </div>
                        <ErrorMessage message={authError} />
                        <AuthForm isLogin={isLoginView} setAuthError={setAuthError} />
                    </div>
                </div>
            </section>
            
            {/* Benefits Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-6">
                     <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Make Smarter Decisions, Faster</h2>
                     </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <CheckCircleIcon />
                            <h3 className="text-xl font-semibold mb-2">Avoid Hidden Costs</h3>
                            <p className="text-gray-600">Identify thousands in potential HVAC costs before you're locked into a lease.</p>
                        </div>
                         <div className="text-center">
                            <CheckCircleIcon />
                            <h3 className="text-xl font-semibold mb-2">Strengthen Your Position</h3>
                            <p className="text-gray-600">Use our detailed reports as a powerful tool to negotiate better lease terms.</p>
                        </div>
                         <div className="text-center">
                            <CheckCircleIcon />
                            <h3 className="text-xl font-semibold mb-2">Save Time and Money</h3>
                            <p className="text-gray-600">Get expert opinions in hours, not days, without costly site visits.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

// --- Logged-in View Components ---
const Dashboard = ({ user }) => {
    const [view, setView] = useState('dashboard'); // 'dashboard', 'resources', 'schedule'

    const handleSignOut = async () => {
        await signOut(auth);
    };

    const renderView = () => {
        switch (view) {
            case 'resources':
                return <Resources />;
            case 'schedule':
                return <ScheduleAssessment user={user} />;
            default:
                return <DashboardHome setView={setView} />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow-md">
                <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <WindIcon />
                        <span className="text-2xl font-bold text-gray-900">Rooftop Intel</span>
                    </div>
                    <div className="flex items-center space-x-4">
                        <span className="text-gray-600 hidden sm:block">Welcome, {user.email}</span>
                        <button onClick={handleSignOut} className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-blue-700">Log Out</button>
                    </div>
                </nav>
            </header>
            <main className="container mx-auto px-6 py-12">
                {view !== 'dashboard' && (
                    <button onClick={() => setView('dashboard')} className="mb-8 text-blue-600 hover:underline">
                        &larr; Back to Dashboard
                    </button>
                )}
                {renderView()}
            </main>
        </div>
    );
};

const DashboardHome = ({ setView }) => {
    return (
        <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">Member Dashboard</h1>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <div 
                    onClick={() => setView('resources')}
                    className="bg-white p-8 rounded-lg shadow-lg cursor-pointer hover:shadow-xl transition-shadow border-t-4 border-blue-500 text-center"
                >
                    <BookOpenIcon />
                    <h2 className="text-2xl font-bold mb-2">Free Resources</h2>
                    <p className="text-gray-600">Access our library of DIY guides and checklists for preliminary HVAC assessments.</p>
                </div>
                <div 
                    onClick={() => setView('schedule')}
                    className="bg-white p-8 rounded-lg shadow-lg cursor-pointer hover:shadow-xl transition-shadow border-t-4 border-orange-500 text-center"
                >
                    <CalendarPlusIcon />
                    <h2 className="text-2xl font-bold mb-2">Schedule Assessment</h2>
                    <p className="text-gray-600">Book a remote video assessment with one of our certified HVAC technicians.</p>
                </div>
            </div>
        </div>
    );
};

const Resources = () => {
    const resourceData = [
        {
            title: "DIY Visual Inspection Checklist (HVAC & Refrigeration)",
            content: `1. **Overall Condition:** Check for widespread rust, physical damage (dents, bent fins), and missing panels. For rooftop units, examine any exposed ductwork for breaks or open seams. Also, inspect the electrical disconnect conduit and box to ensure they are intact and in good condition.
2. **Coil Condition:** Examine the condenser and evaporator coils. Are they damaged, heavily worn, or caked with dirt and debris? Clean coils are crucial for efficiency.
3. **Refrigerant Lines & Oil Leaks:** For split systems, inspect refrigerant lines for damaged or missing insulation. Look closely around the compressor, evaporator, and condenser for any signs of oil residue, which indicates a potential refrigerant leak.
4. **Drain Lines:** Ensure condensate drain lines are properly connected and not clogged. Look for signs of water leakage around the unit, which could point to broken or disconnected drain lines.
5. **Listen for Trouble:** Turn the unit on. Listen for unusual noises like grinding, squealing, or excessive rattling, which can indicate mechanical problems.
6. **Check Filters:** Dirty or clogged air filters are a common cause of poor performance and can strain the system.`,
            images: [
                { src: 'https://placehold.co/400x300/f87171/ffffff?text=Severe+Rust+on+Unit', caption: 'Significant rust on panels is a red flag.' },
                { src: 'https://placehold.co/400x300/fbbf24/ffffff?text=Damaged+Coil+Fins', caption: 'Bent coil fins restrict airflow and reduce efficiency.' },
                { src: 'https://placehold.co/400x300/a3a3a3/ffffff?text=Broken+Rooftop+Ductwork', caption: 'Broken or unsealed ductwork leads to massive energy loss.' }
            ]
        },
        {
            title: "How to Determine a Unit's Age",
            content: `Every HVAC/R unit has a data plate or sticker with manufacturing information, including the serial number. The age is often encoded within this number.
- **Common Formats:** Look for a 4-digit code within the serial number. Often, the first two digits represent the week of the year, and the last two represent the year (e.g., '1408' could mean the 14th week of 2008).
- **Brand Specifics:** The format varies by manufacturer. A quick internet search for "[Brand Name] serial number age lookup" can help you decode it.`,
            images: [
                { src: 'https://placehold.co/400x300/d1d5db/000000?text=Data+Plate+Example', caption: 'Locate the data plate on the exterior of the unit.' },
                { src: 'https://placehold.co/400x300/e5e7eb/000000?text=Close-Up+of+Serial+Number', caption: 'The serial number is key to finding the manufacture date.' },
                { src: 'https://placehold.co/400x300/9ca3af/ffffff?text=Decoding+Serial+Number', caption: 'Online guides can help you decode the specific format.' }
            ]
        },
        {
            title: "Identifying Signs of Refrigerant Leaks",
            content: `Refrigerant is the lifeblood of an AC or refrigeration system. Leaks are a serious and common problem.
- **Oily Residue:** This is the most reliable sign. Look for greasy or oily stains on coils, fittings, and especially around the compressor area.
- **Ice Buildup:** Frost or ice forming on the refrigerant lines or evaporator coil is a classic sign of low refrigerant, often caused by a leak.
- **Hissing Sounds:** A subtle hissing or bubbling sound near the unit can indicate escaping refrigerant gas.
- **Poor Performance:** If the system is running constantly but not cooling effectively, a leak is a likely culprit.`,
            images: [
                { src: 'https://placehold.co/400x300/a3e635/000000?text=Oil+Stain+on+Compressor', caption: 'Dark, oily residue around compressor fittings.' },
                { src: 'https://placehold.co/400x300/bfdbfe/000000?text=Iced-Over+Refrigerant+Line', caption: 'Ice forming on lines is a tell-tale sign of low refrigerant.' },
                { src: 'https://placehold.co/400x300/a3e635/000000?text=Oily+Residue+on+Coil', caption: 'Stains on the coil itself indicate a leak within the coil.' }
            ]
        },
    ];

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-6">DIY Assessment Resources</h1>
            {resourceData.map((res, index) => <ResourceCard key={index} title={res.title} content={res.content} images={res.images} />)}
        </div>
    );
};

const ScheduleAssessment = ({ user }) => {
    const [formData, setFormData] = useState({ address: '', contact: '', phone: '', notes: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        if (!formData.address || !formData.contact || !formData.phone) {
            setError('Please fill out all required fields.');
            setLoading(false);
            return;
        }

        try {
            const assessmentsCollection = collection(db, `artifacts/${appId}/public/data/assessments`);
            await addDoc(assessmentsCollection, {
                ...formData,
                requesterEmail: user.email,
                requesterId: user.uid,
                status: 'pending',
                submittedAt: serverTimestamp()
            });
            setSuccess('Your assessment request has been submitted! We will contact you shortly to confirm a time.');
            setFormData({ address: '', contact: '', phone: '', notes: '' });
        } catch (err) {
            setError('There was an error submitting your request. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Schedule a Remote Assessment</h1>
            <p className="text-gray-600 mb-6">Fill out the details below. Our team will contact you at the provided phone number to schedule the video call.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
                <ErrorMessage message={error} />
                <SuccessMessage message={success} />
                <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">Property Address*</label>
                    <input type="text" name="address" id="address" value={formData.address} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
                </div>
                 <div>
                    <label htmlFor="contact" className="block text-sm font-medium text-gray-700">On-Site Contact Name*</label>
                    <input type="text" name="contact" id="contact" value={formData.contact} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
                </div>
                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">On-Site Contact Phone*</label>
                    <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
                </div>
                <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
                    <textarea name="notes" id="notes" rows="3" value={formData.notes} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"></textarea>
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:bg-orange-300"
                >
                    {loading ? <LoaderIcon /> : 'Submit Request'}
                </button>
            </form>
        </div>
    );
};


// --- Main App Component ---
export default function App() {
    const [user, setUser] = useState(null);
    const [authReady, setAuthReady] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setAuthReady(true);
        });
        return () => unsubscribe();
    }, []);

    if (!authReady) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100">
                <div className="text-center">
                    <WindIcon />
                    <p className="mt-2 text-lg font-semibold text-gray-700">Loading Rooftop Intel...</p>
                </div>
            </div>
        );
    }

    return user ? <Dashboard user={user} /> : <LandingPage />;
}

