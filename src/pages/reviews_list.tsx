import Header from '../components/header/header';
import Footer from '../components/footer/footer';
import '../styles/reviews_list.css';
import otherReviews from '../data/other_reviews.json';

interface Review {
    review: string;
    rating: number;
    author: string;
}

interface ReviewGroup {
    movie: number;
    reviews: Review[];
}

const reviewData = otherReviews as ReviewGroup[];

const flattenReviews = reviewData.flatMap((entry) =>
    entry.reviews.map((review, index) => ({
        id: `${entry.movie}-${index}`,
        movie: entry.movie,
        author: review.author,
        rating: review.rating,
        comment: review.review,
        upvotes: Math.floor(Math.random() * 2200) + 100,
    }))
);

function ReviewsList() {
    const featuredReview = flattenReviews[0];
    const threadReviews = flattenReviews.slice(1, 8);

    return (
        <div className="App">
            <Header />

            <main className="reviews-main">
                <section className="reviews-post-card">
                    <div className="reviews-post-meta">
                        <span className="reviews-post-tag">r/mildlyinteresting</span>
                        <span className="reviews-post-dot" />
                        <span>Featured Review Thread</span>
                    </div>

                    <h1 className="reviews-post-title">
                        Went to a customer&apos;s house today and they had this beautiful elevator directly in the middle of their home
                    </h1>

                    <div className="reviews-post-image" role="img" aria-label="Modern home elevator photo style layout" />

                    <div className="reviews-post-stats">
                        <span>{featuredReview?.upvotes ?? 14230} upvotes</span>
                        <span>{threadReviews.length + 1} comments</span>
                        <span>Movie #{featuredReview?.movie ?? 950387}</span>
                    </div>
                </section>

                <section className="reviews-comments-card">
                    <h2>Top comments</h2>

                    {threadReviews.map((review, index) => (
                        <article className={`review-comment ${index === 1 ? 'is-reply' : ''}`} key={review.id}>
                            <div className="review-comment-header">
                                <span className="review-author">{review.author}</span>
                                <span className="review-separator" />
                                <span className="review-rating">{review.rating}/5</span>
                                <span className="review-separator" />
                                <span className="review-upvotes">{review.upvotes} upvotes</span>
                            </div>
                            <p>{review.comment}</p>
                        </article>
                    ))}
                </section>
            </main>

            <Footer />
        </div>
    );
}

export default ReviewsList;