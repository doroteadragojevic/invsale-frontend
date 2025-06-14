import React, { useEffect, useState } from 'react';

type Review = {
  userName: string;
  reviewDate: string;
  rating: number;
  comment: string;
};

type ProductReviewsProps = {
  productId: number;
};

const ProductReviews: React.FC<ProductReviewsProps> = ({ productId }) => {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/products/reviews/${productId}`)
      .then((res) => res.json())
      .then(setReviews)
      .catch((err) => console.error('Error fetching reviews:', err));
  }, [productId]);

  return (
    <div className="product-reviews">
      {reviews.length === 0 ? (
        <p>No reviews yet.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Review Date</th>
              <th>Rating</th>
              <th>Comment</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((review, index) => (
              <tr key={index}>
                <td>{review.userName}</td>
                <td>{review.reviewDate}</td>
                <td>
                  {'★'.repeat(review.rating)}{' '}
                  {'☆'.repeat(5 - review.rating)}
                </td>
                <td>{review.comment}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ProductReviews;
