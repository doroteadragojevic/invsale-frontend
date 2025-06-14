import { useEffect, useState } from "react";
import "../styles/orderreview.css";
import AdminHeader from "./AdminMenu";

type Review = {
  orderId: number;
  reviewId: number;
  rating: string;
  comment: string;
  reviewDate: string;
};

export default function OrderReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const apiUrl = process.env.REACT_APP_API_URL;

   const user = localStorage.getItem('user');
  const parsedUser = user ? JSON.parse(user) : null;
  const isAdmin = parsedUser?.role === 'admin';

  useEffect(() => {
    // Pretpostavljamo da je potrebno dohvatiti recenzije za korisnika
    const token = localStorage.getItem('token');
    if (token) {
      const user = localStorage.getItem('user');
      const email = user ? JSON.parse(user).email : null;

        fetch(`${apiUrl}/orderreview/`)
          .then(res => res.json())
          .then(setReviews)
          .catch(console.error);
    
    }
  }, [apiUrl]);

  const getStarRating = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(i <= rating ? "★" : "☆");
    }
    return stars.join(" ");
  };

  const formatDate = (date: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(date).toLocaleDateString('en-GB', options);  // Prikazujemo datum u formatu dd/mm/yyyy
  };
  const mapRating = (rating: string) => {
    switch(rating) { 
        case 'FIVE': { 
           return 5;
        } 
        case 'FOUR': { 
           return 4;
        } 
        case 'THREE': { 
            return 3;
         } 
         case 'TWO': { 
            return 2;
         } 
         case 'ONE': { 
            return 1;
         } 
        default: { 
           return 1; 
           break; 
        } 
     } 
  };

  return (
    <div>
      {isAdmin && (<AdminHeader />)}
    <div className="reviews-container">
      <h2>Order Reviews</h2>
      <table className="reviews-table">
        <tbody>
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <tr key={review.reviewId}>
                <td className="rating-stars" style={{width: '150px', verticalAlign: 'top'}}>{getStarRating(mapRating(review.rating))}</td>
                <td>{review.comment}</td>
                <td style={{width: '100px', textAlign: 'right', verticalAlign: 'top'}}>{formatDate(review.reviewDate)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5}>No reviews available</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
    </div>
  );
}
