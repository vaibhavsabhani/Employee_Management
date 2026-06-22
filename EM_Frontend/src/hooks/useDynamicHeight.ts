import { useState, useEffect } from "react";

const useDynamicHeight = (elementIds: string[] = [], extraHeight: number = 0): number => {
    const [dynamicHeight, setDynamicHeight] = useState<number>(0);

    useEffect(() => {
        const calculateHeight = () => {
            const totalHeight = elementIds.reduce((acc, id) => {
                const element = document.getElementById(id);
                const elementHeight = element?.offsetHeight || 0;
                return acc + elementHeight;
            }, extraHeight);

            setDynamicHeight(totalHeight);
        };

        calculateHeight();
        window.addEventListener("resize", calculateHeight);

        return () => {
            window.removeEventListener("resize", calculateHeight);
        };
    }, [elementIds, extraHeight]);

    return dynamicHeight;
};

export default useDynamicHeight;
