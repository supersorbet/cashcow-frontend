import React, { useState, useEffect, useCallback, useContext } from 'react'
import styled from 'styled-components'
import { Link, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import Page from 'components/layout/Page'
import { Heading, Button } from 'cashcow-uikit'
import useTheme from 'hooks/useTheme'
import { useWallet } from '@binance-chain/bsc-use-wallet'
import CowNFT from 'config/abi/CowNFT.json'
import BullNFT from 'config/abi/BullNFT.json'
import NftFarming from 'config/abi/NftFarming.json'
import MilkToken from 'config/abi/MilkToken.json'
import Web3 from "web3";
import { fromWei, toWei, AbiItem, toBN } from "web3-utils";
import { LoadingContext } from 'contexts/LoadingContext'
import { getCowNftAddress, getBullNftAddress, getNftFarmingAddress, getMilkAddress } from 'utils/addressHelpers'
import CowCard from './CowCard'
import BullCard from './BullCard'
import BreedingCard from './BreedingCard'

type boxParam = {
  index: string;
};

const StyledHero = styled.div`
    border-bottom: 1px solid #e8e8e8;
    margin-bottom: 20px;
  `

const BreedingContainer = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: nowrap;
  & > * {
    min-width: 270px;
    max-width: 31.5%;
    width: 100%;
    margin: 0 8px;
    margin-bottom: 32px;
  }
  `
const ActionContainer = styled.div`
  min-width: 230px;
  max-width: calc(25% - 30px);
  flex: 1;
  
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 3%), 0 4px 6px -2px rgb(0 0 0 / 1%);
  position: relative;
  display: flex;
  flex-direction: column;
  text-align: center;
  justify-content: center;
  align-items: center;
`
const ImageContainer = styled.div`
  
`
const ButtonContainer = styled.div`
  text-align: center;
  margin-top: 16px;
`

const BreedingListContainer = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  & > * {
    min-width: 370px;
    max-width: 31.5%;
    width: 100%;
    margin: 0 8px;
    margin-bottom: 32px;
  }
  `
const chainId = process.env.REACT_APP_CHAIN_ID
const web3 = new Web3(Web3.givenProvider)

const FarmBreeding = () => {
  const { setLoading } = useContext(LoadingContext);
  const { account, connect } = useWallet()
  const { index } = useParams<boxParam>();
  const { isDark } = useTheme();
  const [selectedCowTokenId, setSelectedCowTokenId] = useState(0)
  const [selectedBullTokenId, setSelectedBullTokenId] = useState(0)
  const [currentBlockTimestamp, setCurrentBlockTimeStamp] = useState(0);
  const [breedingStarted, setBreedingStarted] = useState(false);
  const [userBreedingItems, setUserItems] = useState({
    0:[],
    1:[],
    2:[],
    3:[],
    4:[],
    5:[]
  });
  const farmingContract = new web3.eth.Contract(NftFarming.abi as AbiItem[], getNftFarmingAddress());

  const handleStartBreeding = async () => {
    setLoading(true);
    // Checking breeding condition
    const cowNftContract = new web3.eth.Contract(CowNFT.abi as AbiItem[], getCowNftAddress());
    const bullNftContract = new web3.eth.Contract(BullNFT.abi as AbiItem[], getBullNftAddress());

    const attrOfCow = await cowNftContract.methods.attrOf(selectedCowTokenId).call();
    const attrOfBull = await bullNftContract.methods.attrOf(selectedBullTokenId).call();

    if (attrOfCow.rarity === attrOfBull.rarity) {
      try {
        const breedingPrice = await farmingContract.methods.breedingPrice().call();
        console.log(breedingPrice)
        const milkTokenContract = new web3.eth.Contract(MilkToken.abi as AbiItem[], getMilkAddress());
        const userBalance  = await milkTokenContract.methods.balanceOf(account).call();
        console.log(userBalance)
        if(toBN(userBalance).lt(toBN(breedingPrice))) {
          toast.error("You must have " + fromWei(breedingPrice, 'ether') + "MILK to breed")
          return;
        }
        const allowance = await milkTokenContract.methods.allowance(account, getNftFarmingAddress()).call();

        // await cowNftContract.methods.approve(getNftBreedingAddress() , selectedCowTokenId).send({from: account});
        // await bullNftContract.methods.approve(getNftBreedingAddress(),selectedBullTokenId).send({from: account});
        if (parseInt(allowance.toString()) < parseInt(breedingPrice))
          await milkTokenContract.methods.approve(getNftFarmingAddress(), breedingPrice.toString()).send({ from: account });

        await farmingContract.methods
          .breed(selectedCowTokenId, selectedBullTokenId)
          .send({ from: account })
          .on('transactionHash', function () {
            toast.success('Transaction submitted');
          })
          .on('receipt', function (receipt) {
            console.log(receipt);
            fetchInfo();
            setLoading(false);
            setBreedingStarted(!breedingStarted)
            toast.success('Breeding started');
          })
          
      } catch (err: unknown) {
        console.log("ERROR: ", err);
        setLoading(false);
        
        const { message } = err as Error
        toast.error(message);
      }
    } else {
      toast.error('Cannot breed between Cow and Bull with different rarities')
    }
  }
  async function fetchInfo() {
    try {
      setLoading(true)
      let userItems = await farmingContract.methods.getBreedingItems(account).call();
      let currentBlock = await web3.eth.getBlock("latest");
      let currentTime = currentBlock.timestamp;
      setCurrentBlockTimeStamp(Number(currentTime));
      console.log(userItems);
      setUserItems(userItems)
      setLoading(false);
    } catch (error) {
      console.log(error)
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchInfo();
  }, [account])
  return (
    <Page style={{
      backgroundImage: isDark ? `url(/images/cow/home-backgrounddark.png)` : `url(/images/cow/home-backgroundlight.png)`,
      backgroundPosition: 'center',
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
    }}
    >
      <StyledHero>
        <Heading as="h1" size="lg" color="secondary" mb="20px" style={{ color: isDark ? "white" : '' }}>
          BREEDING
        </Heading>
      </StyledHero>
      <Heading as="h1" size="no" color="primary" mb="20px" style={{ color: isDark ? "white" : '' }}>
        TOTAL BREEDING FEES : 90 MILK
      </Heading>
      <BreedingContainer>
        <CowCard selectTokenId={setSelectedCowTokenId} updateFlag = {breedingStarted} key = "bullcard"/>
        <ActionContainer>
          <ImageContainer>
            <img src='/images/hearsf.gif' alt="" />
          </ImageContainer>
          <ButtonContainer>
            <Button disabled={selectedCowTokenId === 0 || selectedBullTokenId === 0} onClick={handleStartBreeding}>BIG BANG</Button>
          </ButtonContainer>
        </ActionContainer>
        <BullCard selectTokenId={setSelectedBullTokenId} updateFlag = {breedingStarted}/>
      </BreedingContainer>
      <BreedingListContainer>
        {
          userBreedingItems["0"].map((cowId, idx) =>{ //0:cowid, 1: rarity,2:cowbreed,3:bullid, 4:bullbreed,5:locktime
            let _restTime = (userBreedingItems[5][idx] - currentBlockTimestamp ) ;
            let restTime = 0;
            let unitTime = "S";
            if(_restTime > 60 ) {
              restTime = (userBreedingItems[5][idx] - currentBlockTimestamp) /60;
              unitTime = "M"
            }
            
            if(_restTime >3600) {
              restTime = (userBreedingItems[5][idx] - currentBlockTimestamp) / 3600;
              unitTime = "H";
            } 
            
            let _bullId = userBreedingItems[3][idx];
            let _cowBreed = userBreedingItems[2][idx];
            let _bullBreed = userBreedingItems[4][idx];
            let _rarity = userBreedingItems[1][idx];
            console.log(restTime);
            return <BreedingCard 
                        key = {cowId + "_" + idx}
                        unLockTime={Math.round(restTime)}
                        unit = {unitTime} 
                        bullId = {_bullId} 
                        rarity = {_rarity}
                        cowBreed = {_cowBreed}
                        bullBreed = {_bullBreed}
                    />
          })
        }
      </BreedingListContainer>
    </Page>
  )
}

export default FarmBreeding
