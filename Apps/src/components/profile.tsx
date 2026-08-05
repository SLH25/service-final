import { useAuth } from "./SignupPage/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState , useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchMe, updateMe } from "./authApi";
import { 
    User, 
    Mail, 
    Calendar, 
    LogOut, 
    Edit2, 
    Shield, 
    Clock,
    X
} from "lucide-react";
import UpdateForm, { type UpdateFormData } from "./SignupPage/UpdateProfileForm";

interface UserProfile {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

const Profile = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [popUp, setPopup] = useState(false);
    const [userData , setUserData] = useState<UserProfile | null>(null);
    const [editPopup, setEditPopup] = useState(false);
    const [updateFormData, setUpdateFormData] = useState<UpdateFormData>({
        firstName: "",
        lastName: "",
        email: ""
    });
    const [updateErrors, setUpdateErrors] = useState<{ firstName?: string; lastName?: string; email?: string; form?: string }>({});
    const [isUpdating, setIsUpdating] = useState(false);

    const loggedOut = async () => {
        await logout();
        navigate("/");
    }
    const togglePopup = () => {
        setPopup(!popUp);
    }
    const toggleEditPopup = () => {
        if (!editPopup && userData) {
            // Pre-fill form with current user data
            setUpdateFormData({
                firstName: userData.first_name,
                lastName: userData.last_name,
                email: userData.email
            });
        }
        setEditPopup(!editPopup);
    }


    useEffect( ()=>{
        fetchUserProfile()
    },[])


    const fetchUserProfile = async () => {
        try {
            const token = localStorage.getItem("access_token");
            if (!token) return;

            const me = await fetchMe(token);
            const profile = me.profile ?? ({} as Record<string, unknown>);
            setUserData({
                id: me.id,
                username: me.username,
                email: me.email,
                first_name: (profile.first_name as string) ?? "",
                last_name: (profile.last_name as string) ?? "",
                role: me.role,
                is_active: true,
                created_at: "",
                updated_at: "",
            });
        } catch (error) {
            console.error("fetching profile failed:", error);
        }
    };
    
    const handleUpdateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUpdateFormData(prev => ({ ...prev, [name]: value }));
        // Clear errors when user types
        if (updateErrors[name as keyof typeof updateErrors]) {
            setUpdateErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleUpdateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdating(true);
        setUpdateErrors({});

        try {
            const token = localStorage.getItem("access_token");
            if (!token) return;

            const me = await updateMe(token, {
                email: updateFormData.email,
                first_name: updateFormData.firstName,
                last_name: updateFormData.lastName,
            });
            const profile = me.profile ?? ({} as Record<string, unknown>);
            setUserData({
                id: me.id,
                username: me.username,
                email: me.email,
                first_name: (profile.first_name as string) ?? "",
                last_name: (profile.last_name as string) ?? "",
                role: me.role,
                is_active: true,
                created_at: "",
                updated_at: "",
            });
            setEditPopup(false);
        } catch (error) {
            console.error("Update failed:", error);
            setUpdateErrors({ form: "Une erreur est survenue lors de la mise à jour." });
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <>
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
            {userData ? (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-2xl overflow-hidden sm:rounded-3xl w-full max-w-2xl"
                >
                    {/* Header Section */}
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 px-6 py-8 sm:px-8 flex justify-between items-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-white/10 pattern-grid-lg opacity-10"></div>
                        <div>
                            <h3 className="text-2xl leading-6 font-bold text-white flex items-center gap-2">
                                <User className="w-6 h-6" />
                                Mon Profil
                            </h3>
                            <p className="mt-2 max-w-2xl text-sm text-white/90">
                                Gérer vos informations personnelles
                            </p>
                        </div>
                        {/* <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full shadow-sm ${userData.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            <Shield className="w-3 h-3 mr-1 self-center" />
                            {userData.is_active ? 'Compte Actif' : 'Inactif'}
                        </span> */}
                    </div>

                    {/* Body Section */}
                    <div className="border-t border-gray-200 dark:border-gray-700">
                        <dl className="divide-y divide-gray-200 dark:divide-gray-700">
                            <div className="px-6 py-5 sm:grid sm:grid-cols-3 sm:gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                    <User className="w-4 h-4" /> Nom complet
                                </dt>
                                <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2">
                                    {userData.first_name} {userData.last_name}
                                </dd>
                            </div>
                            <div className="px-6 py-5 sm:grid sm:grid-cols-3 sm:gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                    <Shield className="w-4 h-4" /> Nom d'utilisateur
                                </dt>
                                <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2">
                                    @{userData.username}
                                </dd>
                            </div>
                            <div className="px-6 py-5 sm:grid sm:grid-cols-3 sm:gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                    <Mail className="w-4 h-4" /> Email
                                </dt>
                                <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2">
                                    {userData.email}
                                </dd>
                            </div>
                            <div className="px-6 py-5 sm:grid sm:grid-cols-3 sm:gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                    <Calendar className="w-4 h-4" /> Membre depuis
                                </dt>
                                <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2">
                                    {new Date(userData.created_at).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
                                </dd>
                            </div>
                            <div className="px-6 py-5 sm:grid sm:grid-cols-3 sm:gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                    <Clock className="w-4 h-4" /> Dernière mise à jour
                                </dt>
                                <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2">
                                    {new Date(userData.updated_at).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
                                </dd>
                            </div>
                        </dl>
                    </div>

                    {/* Footer Actions */}
                    <div className="px-6 py-6 bg-gray-50 dark:bg-gray-900/50 flex flex-col sm:flex-row justify-end gap-3">
                        <motion.button 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={toggleEditPopup} 
                            className="inline-flex items-center justify-center px-5 py-2.5 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-xl text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-all"
                        >
                            <Edit2 className="w-4 h-4 mr-2" />
                            Modifier le profil
                        </motion.button>
                        
                        <motion.button 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={togglePopup} 
                            className="inline-flex items-center justify-center px-5 py-2.5 border border-transparent shadow-sm text-sm font-medium rounded-xl text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Se déconnecter
                        </motion.button>
                    </div>
                </motion.div>
            ) : (
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-yellow-500 mx-auto mb-6"></div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Chargement du profil...</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Veuillez patienter un instant</p>
                </div>
            )}
        </div>
        
        <AnimatePresence>
        {popUp && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            >
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 max-w-sm w-full transform transition-all border border-gray-100 dark:border-gray-700"
                >
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <LogOut className="w-8 h-8 text-red-600 dark:text-red-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
                        Déconnexion
                    </h2>
                    <p className="text-center text-gray-500 dark:text-gray-400 mb-8">
                        Êtes-vous sûr de vouloir vous déconnecter de votre compte ?
                    </p>
                    <div className="flex flex-col gap-3">
                        <button onClick={loggedOut} className="w-full px-4 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl transition-colors shadow-lg shadow-red-500/30 flex items-center justify-center gap-2">
                            Oui, me déconnecter
                        </button>
                        <button onClick={togglePopup} className="w-full px-4 py-3.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-bold rounded-2xl transition-colors">
                            Annuler
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        )}
        </AnimatePresence>

        <AnimatePresence>
        {editPopup && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
            >
                <motion.div 
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 max-w-md w-full relative border border-gray-100 dark:border-gray-700 my-8"
                >
                    <button 
                        onClick={toggleEditPopup} 
                        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Edit2 className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Modifier le profil
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            Mettez à jour vos informations
                        </p>
                    </div>

                    <UpdateForm 
                        formData={updateFormData}
                        errors={updateErrors}
                        isSubmitting={isUpdating}
                        handleInputChange={handleUpdateInputChange}
                        handleSubmit={handleUpdateSubmit}
                    />
                </motion.div>
            </motion.div>
        )}  
        </AnimatePresence>
        
        </>
    );
}

export default Profile;
