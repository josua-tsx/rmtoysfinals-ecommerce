import { FaStar } from 'react-icons/fa';

export default function StarsRating({rating, setRating}) {

    // const handleClick = (index) => {
    //     setRating(index + 1)
    // }

    // to get the average stars rating
    // const averageRating = ratings.reduce((acc, curr) => acc + curr.rating, 0) / ratings.length || 0;

  return (
    <div className='flex'>

        {
            Array.from({length: 5}).map((_, index) => (
                <FaStar
                key={index}
                // onClick={() => handleClick(index)}
                className={`h-4 w-4 md:w-5 cursor-pointer ${index < rating ? "text-orange-300": "text-gray-300"}`}
                
                />
            ))
        }

    </div>
  )
}
