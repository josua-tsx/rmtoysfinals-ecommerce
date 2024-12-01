import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/scrollbar';


import car from '../../assets/car.png'
import ImageCard from "./ImageCard";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";

export default function ImageSlider() {

  const {data: bestProducts =[], isPending, isError} = useQuery({
    queryKey: ["bestProducts"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/product/get-bestProducts`)
      return res.data
    }
  })


  if (isPending) return <p>Loading...</p>
  if (isError) return <p>Error.</p>

  return (
  
<Swiper
  className="flex w-[360px] drop-shadow-md md:w-[542px] flex-col overflow-hidden justify-center mx-auto"
  effect="coverflow"
  grabCursor={true}
  centeredSlides={true}
  slidesPerView={2} // Adjust this to control how much of the side slides are visible
  spaceBetween={40} // Adjust this to bring slides closer or farther apart
  coverflowEffect={{
    rotate: 0, // No rotation
    stretch: 0, // No stretch
    depth: 100, // Minimal depth for a flat effect
    modifier: 1, // Control the intensity of the effect
    slideShadows: false, // Disable slide shadows
  }}
 
  modules={[EffectCoverflow]}
  initialSlide={2} // Center the second slide initially
>
 
  {
    bestProducts.length > 0 ? (
      bestProducts.map((best) => (
        <SwiperSlide key={best._id}>
        <ImageCard product={best} />
      </SwiperSlide>
     
      ))
    ) : <p>No products yet.</p>
  }

</Swiper>

  );
}
