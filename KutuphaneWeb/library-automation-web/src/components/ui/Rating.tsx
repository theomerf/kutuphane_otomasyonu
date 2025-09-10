import { faStar } from '@fortawesome/free-solid-svg-icons';
import { faStar as farStar } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type RatingProps = {
  rating: number;
}

export const Rating = ({ rating }: RatingProps) => {
  const stars = Array.from({ length: 5 }, (_, i) => i < rating ? "full" : "empty");

  return (
    <>
      {stars.map((star, index) => (
        <FontAwesomeIcon
          key={index}
          icon={star === "full" ? faStar : farStar}
          className="text-yellow-300"
        />
      ))}
    </>
  );
};
