import { Route } from 'react-router';
import { useQuery } from '@apollo/client';

import Books from '../../components/Shopping/Books/Books';
import {
    ShoppingStyle,
    Card,
    MainArea,
    SideBars,
} from '../../styles/ShoppingStyle';
import Pagination from '../../components/Pagination/Pagination';
import SmallBooks from '../../components/Shopping/SmallBooks/SmallBooks';
import {
    GET_BOOK_PAGINATION_META_QUERY,
    GET_DISCOUNTED_BOOKS,
    GET_RANDOM_BOOK_QUERY,
} from '../../lib/graphql';
import Loader from '../../components/Loader/Loader';

const Shopping = ({ match }) => {
    const { data: relatedBooksData, loading: relatedBooksLoading } = useQuery(
        GET_RANDOM_BOOK_QUERY,
        {
            variables: { limit: 4 },
        }
    );
    const relatedBooks = relatedBooksData?.getRandomBooks;
    const { data: discountBooksData, loading: discountBooksLoading } = useQuery(
        GET_DISCOUNTED_BOOKS,
        {
            variables: { limit: 3 },
        }
    );
    const discountBooks = discountBooksData?.getDiscountedBooks;

    const perPage = 9;

    const { data, loading, error } = useQuery(GET_BOOK_PAGINATION_META_QUERY);

    if (error) {
        return <h1>Something went wrong. Please try again later</h1>;
    }

    return loading ? (
        <Loader />
    ) : (
        <>
            <ShoppingStyle>
                <Pagination
                    perPage={perPage}
                    bookCount={data.getBookPaginationMeta.count}
                />
                <MainArea>
                    <Route
                        path={`${match.path}/:page`}
                        render={(props) => (
                            <Books perPage={perPage} {...props} />
                        )}
                    />
                    <SideBars>
                        <Card>
                            <h4>RELATED PRODUCTS</h4>
                            {relatedBooks && relatedBooks.length > 0 && (
                                <SmallBooks books={relatedBooks} />
                            )}
                        </Card>
                        <Card>
                            <h4>PROMOTION</h4>
                            {discountBooks && discountBooks.length > 0 && (
                                <SmallBooks books={discountBooks} />
                            )}
                        </Card>
                    </SideBars>
                </MainArea>
            </ShoppingStyle>
        </>
    );
};

export default Shopping;
