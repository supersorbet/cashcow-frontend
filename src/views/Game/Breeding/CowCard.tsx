import React, { useState, useEffect, useMemo, useCallback,useContext } from 'react'
import styled from 'styled-components'
import Modal from 'react-modal'
import useTheme from 'hooks/useTheme'
import CowNFT from 'config/abi/CowNFT.json'
import NftFarming from 'config/abi/NftFarming.json'
import { useWallet } from '@binance-chain/bsc-use-wallet'
import { AbiItem } from 'web3-utils'
import Web3 from 'web3'
import { LoadingContext } from 'contexts/LoadingContext'
import { getCowNftAddress, getNftFarmingAddress } from 'utils/addressHelpers'
import {CATTLE_RARITY, COW_BREED,CASH_COWNFT_IMAGE_BASEURI } from "config/constants/nfts";
import { MDBMask, MDBView, MDBContainer } from 'mdbreact';
const Container = styled.div`
    max-width: 200px;
    overflow: hidden;
    position: relative;
    
`

const TitleContainer = styled.div`
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    border-radius: 22px;
    background-color: rgb(11,51,75);
`

const ActionContainer = styled.div`
    margin-top: 20px;
    margin-left: 0px;
    margin-right: 16px;
    padding: 16px;
    font-size: 20px;
    font-weight: 1000;
    line-height: 1.5;
    width: 100%;
    display: flex;
    align-items: center;
    align-items: center;
    justify-content: space-evenly;
    color: #689330;
    background-color: rgb(11,51,75);
    border-radius: 22px;
    cursor: pointer;
    `
const ModalTitleContainer = styled.div`
    width: 100%;
    margin-top: 8px;
    margin-bottom: 8px;
    font-size: 24px;
    font-weight: 1000;
    line-height: 1.5;
    display: flex;
    align-items: center;
    justify-content: center;
    `
const ModalNftsContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    margin: 0 -15px;
    justify-content: center;
    & > * {
        margin: 5px;
    }
    `
const NftItemContainer = styled.div`
    
`


const chainId = process.env.REACT_APP_CHAIN_ID
const web3 = new Web3(Web3.givenProvider)

const CowCard = ({selectTokenId, updateFlag}) => {
    const [isModalOpen, setModalOpen] = useState(false)
    const { setLoading } = useContext(LoadingContext);
    const [selectedTokenId, setSelectedTokenId] = useState(0)
    const [selectedImage, setTokenImage ] = useState('');
    const { isDark } = useTheme();
    const { account } = useWallet()
    const [selectedNfts, setSelectedNfts] = useState([])
    const nftContract = useMemo(() => {
        return new web3.eth.Contract(CowNFT.abi as AbiItem[], getCowNftAddress())
      }, [])
    const farmingContract = new web3.eth.Contract(NftFarming.abi as AbiItem[], getNftFarmingAddress())
    
    const handleSelectNft = (tid : any, imageUrl: string) => {
        setModalOpen(false)
        setSelectedTokenId(tid)
        setTokenImage(imageUrl);
        selectTokenId(tid)
    }

    const fetchNftItems = useCallback(async () => {
        // setLoading(true);
        // const tokenIds = await nftContract.methods.tokenIdsOf(account).call()
        const tokenIds = await farmingContract.methods.breedingCowTokenIdsOf(account).call({from:account});
        const promises = []
        for (let i = 0; i < tokenIds.length;i ++) {
            promises.push(nftContract.methods.attrOf(tokenIds[i]).call())
        }
        const attrs = await Promise.all(promises)

        const filteredItems = []
        for (let i = 0; i < tokenIds.length;i ++) {
            const nftItem = {
                collectionName: "Cow",
                tokenId: tokenIds[i],
                rarity: attrs[i].rarity,
                breed: attrs[i].breed,
                image:CASH_COWNFT_IMAGE_BASEURI + CATTLE_RARITY[attrs[i].rarity]+"-" + COW_BREED[attrs[i].breed] + ".png"
            };
            filteredItems.push(nftItem);
        }
        setSelectedNfts(filteredItems);
        setSelectedTokenId(0);
    }, [account, nftContract, updateFlag])
    
    useEffect(() => {
        fetchNftItems()
    }, [fetchNftItems,updateFlag])
    
    return (
        <Container>    
            <TitleContainer>
                <MDBContainer className = "mt-1">
                    {selectedTokenId == 0?
                        <MDBView>
                            <img src="/images/svgs/femenino.svg" alt="" style={{width: "200px",  height: "200px"}}/>
                        </MDBView>
                        :
                        <MDBView rounded>
                            <img src={selectedImage} alt="" style={{width: "200px",  height: "180px", borderRadius: '75px'}}/>
                            <MDBMask className = 'flex-center' >
                                <img src="/images/breeding/marcometal.png" alt="" />
                            </MDBMask>
                        </MDBView>
                    }
                </MDBContainer>
            </TitleContainer>
            <ActionContainer onClick={(e) => setModalOpen(true)}>
                {selectedTokenId === 0 ? "ADD NFT" : "CHANGE NFT"}
                {selectedTokenId == 0?
                    <div style = {{height: '30px'}}>
                        <img src="/images/breeding/boton-gris.png" alt="" style = {{width: '30px'}}/>
                    </div>
                    :
                    <div style = {{height: '30px'}}>
                        <img src="/images/breeding/boton-verde.png" alt="" style = {{width: '30px'}}/>
                    </div>
                }
            </ActionContainer>
            <Modal
                isOpen={isModalOpen}
                onRequestClose={() => setModalOpen(false)}
                ariaHideApp={false}
                style={{
                    content: {
                    top: '50%',
                    left: '50%',
                    right: 'auto',
                    bottom: 'auto',
                    marginRight: '-50%',
                    transform: 'translate(-50%, -50%)',
                    minWidth: '50vw',
                    maxWidth: '50vw',
                    borderRadius: '15px',
                    background: isDark ? '#27262c' : 'white',
                    zindex: 15,
                    }
                }}
                contentLabel="Example Modal"
                >
                <ModalTitleContainer>My Cows</ModalTitleContainer>
                <ModalNftsContainer>
                    {selectedNfts.map((nftEachItem, idx) => {
                        return <NftItemContainer onClick={() => handleSelectNft(nftEachItem.tokenId, nftEachItem.image)} key = {nftEachItem.tokenId + "_" + idx}>
                            <img src={nftEachItem.image} alt="" style={{width: "160px",  height: "160px"}} key={nftEachItem.tokenId} />
                        </NftItemContainer>
                        
                    })}
                </ModalNftsContainer>
            </Modal>
        </Container>
    )
}

export default CowCard
