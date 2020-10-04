import { useEffect, useRef } from 'react';
import ResizeObserver from 'resize-observer-polyfill';

// observe element size changes
const useResizeObserver = ({ callback, element }) => {

    const current = element && element.current;

    const observer = useRef(null);

    useEffect(() => {

        const observe = () => {
            if (element && element.current && observer.current) {
                observer.current.observe(element.current);
            }
        };

        // if we are already observing old element, unobserve
        if (observer && observer.current && current) {
            observer.current.unobserve(current);
        }

        const resizeObserverOrPolyfill = ResizeObserver;
        observer.current = new resizeObserverOrPolyfill(callback);
        observe();

        return () => {
            // clean up
            if (observer && observer.current && element?.current) {
                observer.current.unobserve(element?.current);
            }
        }
    }, [current, callback, element]);

};

export default useResizeObserver