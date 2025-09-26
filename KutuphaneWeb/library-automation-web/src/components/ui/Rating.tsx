import { faStar, faStarHalfAlt } from '@fortawesome/free-solid-svg-icons';
import { faStar as farStar } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type RatingProps = {
  rating: number;
};

export const Rating = ({ rating }: RatingProps) => {
  return (
    <>
      {[0, 1, 2, 3, 4].map((i) => (
        <FontAwesomeIcon
          key={i}
          icon={
            rating >= i + 1
              ? faStar
              : rating >= i + 0.5
              ? faStarHalfAlt
              : farStar
          }
          className="text-yellow-300"
        />
      ))}
    </>
  );
};