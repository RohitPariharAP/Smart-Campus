// import { useForm } from 'react-hook-form';
// import { useAuth } from '../context/AuthContext';
// import axios from 'axios';
// import { toast } from 'react-hot-toast';
// import { useNavigate } from 'react-router-dom';

// export default function LoginPage() {
//   const { register, handleSubmit } = useForm();
//   const { login } = useAuth();
//   const navigate = useNavigate();

//   const onSubmit = async (data) => {
//     try {
//       const response = await axios.post('/api/auth/login', data);
//       login(response.data);
//       toast.success('Login successful!');
//       navigate('/dashboard');
//     } catch (error) {
//       toast.error(error.response?.data?.error || 'Login failed');
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center">
//       <div className="max-w-md w-full space-y-8">
//         <h2 className="text-2xl font-bold text-center">Login</h2>
//         <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//           <input type="email" {...register('email')} placeholder="Email" required />
//           <input type="password" {...register('password')} placeholder="Password" required />
//           <button type="submit" className="w-full bg-blue-600 text-white py-2 px-4 rounded-md">Login</button>
//         </form>
//       </div>
//     </div>
//   );
// }
