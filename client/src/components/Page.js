import { BrowserRouter } from 'react-router-dom';
import Header from './Header';

const Page = ({ children }) => {
    return (
        <>
            <BrowserRouter>
                <Header></Header>
                {children}
            </BrowserRouter>
        </>
    );
};

export default Page;
