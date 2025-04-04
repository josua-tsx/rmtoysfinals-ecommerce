import { useMutation } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axiosInstance from '../lib/axios';
import toast from 'react-hot-toast';
import { useEffect } from 'react';

export default function PurchaseSuccessPage() {
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get("session_id");
    const navigate = useNavigate();
  
    const { mutate: confirmOrder, isLoading } = useMutation({
      mutationFn: async () => {
        const response = await axiosInstance.post("/order/checkout-success", { sessionId });
        return response.data;
      },
      onSuccess: (data) => {
          navigate("/cart"); // Redirect to order history page
          toast.success("Order placed successfully!");
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || "Failed to confirm order.");
        navigate("/");
      },
    });
  
    useEffect(() => {
      if (sessionId) {
        confirmOrder();
      }
    }, [sessionId, confirmOrder]);
  
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        {isLoading ? <p>Processing your order...</p> : <p>Redirecting...</p>}
      </div>
    );
  }

