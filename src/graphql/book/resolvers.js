const { ApolloError, AuthenticationError } = require('apollo-server');

const bookModule = require('../../models/book/Book');
const userModule = require('../../models/user/User');
const cloudinary = require('../../util/cloudinary');

const constructConditionFromCriteria = (criteria) => {
    const { titleContains } = criteria;

    criteria = [];
    if (titleContains) {
        const regex = new RegExp(`.*${titleContains}.*`, 'i');
        criteria.push({ title: regex });
    }

    let condition = {};
    if (criteria.length > 0) {
        condition = { $or: criteria };
    }
    return condition;
};

module.exports = {
    Query: {
        async findBooks(parent, args, context, info) {
            try {
                const condition = constructConditionFromCriteria(args.criteria);
                const { skip, limit } = args;
                const books = await bookModule.findPaginate(
                    condition,
                    { createdAt: -1 },
                    skip,
                    limit
                );
                return books;
            } catch (error) {
                throw new Error(error);
            }
        },
        async findBookById(parent, args, context, info) {
            try {
                const { id } = args;
                return await bookModule.findOneById(id);
            } catch (error) {
                throw new Error(error);
            }
        },
        async getBookPaginationMeta(parent, args, context, info) {
            try {
                const condition = constructConditionFromCriteria(args.criteria);
                const count = await bookModule.countBooks(condition);
                return { count };
            } catch (error) {
                throw new Error(error);
            }
        },
        async getRandomBooks(parent, args, context, info) {
            try {
                const { limit } = args;
                return await bookModule.getRandomBooks(limit);
            } catch (error) {
                throw new Error(error);
            }
        },
        async getDiscountedBooks(parent, args, context, info) {
            try {
                const { limit } = args;
                return await bookModule.getDiscountedBooks(limit);
            } catch (error) {
                throw new Error(error);
            }
        },
    },
    Mutation: {
        async addBook(parent, args, context, info) {
            try {
                const parsedToken = context.req.parsedToken;
                if (!parsedToken) {
                    throw new ApolloError('Please login first');
                }
                const user = await userModule.findById(parsedToken.id);
                if (!user) {
                    throw new ApolloError('Cannot find user profile');
                }

                if (args.image && args.image !== '') {
                    args.image = (
                        await cloudinary.uploader.upload(args.image)
                    ).url;
                }

                const newBook = await bookModule.insert({
                    ...args,
                    seller: user._id,
                });
                await userModule.addNewBook(user._id, newBook._id);
                return newBook;
            } catch (error) {
                throw new Error(error);
            }
        },
        async updateBook(parent, args, context, info) {
            try {
                const { id } = args;
                delete args.id;

                const parsedToken = context.req.parsedToken;
                if (!parsedToken) {
                    throw new ApolloError('Please login first');
                }
                const user = await userModule.findById(parsedToken.id);
                if (!user) {
                    throw new ApolloError('Cannot find user profile');
                }
                if (user._doc.books.includes(id)) {
                    if (args.image && args.image !== '') {
                        args.image = (
                            await cloudinary.uploader.upload(args.image)
                        ).url;
                    }
                    const newBook = await bookModule.updateById(id, args);
                    if (!newBook) {
                        throw new ApolloError('Book does not exists');
                    }
                    return newBook;
                } else {
                    throw new AuthenticationError(
                        'You are not allowed to update this book'
                    );
                }
            } catch (error) {
                throw new Error(error);
            }
        },
        async deleteBook(parent, args, context, info) {
            try {
                const { id } = args;

                const parsedToken = context.req.parsedToken;
                if (!parsedToken) {
                    throw new ApolloError('Please login first');
                }
                const user = await userModule.findById(parsedToken.id);
                if (!user) {
                    throw new ApolloError('Cannot find user profile');
                }
                if (user._doc.books.includes(id)) {
                    return await bookModule.deleteById(id);
                } else {
                    throw new AuthenticationError(
                        'You are not allowed to update this book'
                    );
                }
            } catch (error) {
                throw new Error(error);
            }
        },
    },
};
