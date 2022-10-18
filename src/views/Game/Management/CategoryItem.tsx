import React from 'react'
import styled from 'styled-components'


export interface CategoryItemInterface {
    background?: string;
}

// const ItemBackgroundCover = styled.div`
//     width: 80%;
//     height: 80%;
//     background-color: #0B3D4C;
//     display: flex;
//     justify-content: center;
//     position: relative;
//     border-radius: 32px;
// `

const CategoryItem = ({background}: CategoryItemInterface) => {
    const ItemBackground = styled.div`
        width: 400px;
        height: 400px;
        background-image : url(/images/nftindividuals/${background});
        background-size: 100% 80%;
        background-position: 0;
        background-repeat: no-repeat;
        cursor: pointer;
        transition: all 1s;
        &:hover{
            transform: scale(0.95);
        }
        @media (max-width: 768px) {
            background-position: 30%;
        }
        `
    return (
        // <ItemBackgroundCover>
            <ItemBackground />
        // </ItemBackgroundCover>
    )
}

export default CategoryItem