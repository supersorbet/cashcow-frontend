import React, { useState, useEffect, useCallback } from 'react'
import styled from 'styled-components'
import {Link, useParams} from 'react-router-dom'
import { useWallet } from '@binance-chain/bsc-use-wallet'
import Web3 from "web3";
import { fromWei, toWei, AbiItem, toBN } from "web3-utils";
import Page from 'components/layout/Page'
import { Heading } from 'cashcow-uikit'
import useTheme from 'hooks/useTheme'
import AirNft from 'config/abi/AirNft.json'
import HappyCows from 'config/abi/HappyCows.json'
import NftFarming from 'config/abi/NftFarming.json'
import CowTokenABI from 'config/abi/cow.json'
import GENESIS_NFT_IDS from 'config/constants/airnfts'
import HAPPY_COW_BREEDS from 'config/constants/happycowbreeds'
import { getNftSaleAddress, getNftFarmingAddress, getCowTokenAddress, getAirNftAddress, getHappyCowAddress } from 'utils/addressHelpers'
import StaticCard from './StaticCard'
import CattleCard from './CattleCard'
import LandCard from './LandCard'
import GenesisCard from './GenesisCard'
import HappyCowCard from './HappyCowCard'


type boxParam = {
  index: string;
};

const DEFAULT_HAPPYCOW_STATUS = [false, false, false, false, false]; 
const StyledHero = styled.div`
    border-bottom: 1px solid #e8e8e8;
    margin-bottom: 20px;
  `

const CardContainer = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  & > * {
    min-width: 270px;
    max-width: 31.5%;
    width: 100%;
    margin: 0 8px;
    margin-bottom: 32px;
  }
  `
const web3 = new Web3(Web3.givenProvider);
const FarmDashboard = () => {
    const { account, connect } = useWallet()
    const { index } = useParams<boxParam>();
    const { isDark } = useTheme();
    const [milkPower, setMilkPower] = useState(0)
    const [gameMilkPower, setGameMilkPower] = useState(0)
    const [landAmount, setLandAmount] = useState(0)
    const [cowAmount, setCowAmount] = useState(0)
    const [bullAmount, setBullAmount] = useState(0)
    const [cowTokenAmount, setCowTokenAmount] = useState("0")
    const [genesisNftStatus, setGenesisNftStatus] = useState(false)
    const [happyCowStatus, setHappyCowStatus] = useState(DEFAULT_HAPPYCOW_STATUS)
    const [milkPerDay, setMilkPerDay] = useState(0);

    useEffect( () => {
      async function fetchInfo() {
          const farmingContract = new web3.eth.Contract(NftFarming.abi as AbiItem[], getNftFarmingAddress());
          const vMilkPower = await farmingContract.methods.milkPowerOf(account).call();
          const vGameMilkPower = await farmingContract.methods.milkPowerOfGame().call();
          setMilkPower(vMilkPower);
          setGameMilkPower(vGameMilkPower);

          if(parseInt(vGameMilkPower) === 0) {
            setMilkPerDay(0);
          } else {
            const vMilkPerDay = 1500 * parseInt(vMilkPower) / parseInt(vGameMilkPower);
            console.log(vMilkPerDay);
            setMilkPerDay( vMilkPerDay );
          }

          const landTokenIds = await farmingContract.methods.landTokenIdsOf(account).call();
          if(landTokenIds) {
            console.log("AAA")
            setLandAmount(landTokenIds.length);
          }
          console.log(landTokenIds);
      }

      fetchInfo();
    },[account])

    /* useEffect( () => {
      async function fetchGenesisInfo() {
          
          const contractInstance = new web3.eth.Contract(AirNft.abi as AbiItem[], getAirNftAddress());

          const promises = []
          for (let i = 0; i < GENESIS_NFT_IDS.length;i ++) {
              promises.push(contractInstance.methods.ownerOf(GENESIS_NFT_IDS[i]).call())
          }
          const nftOwners = await Promise.all(promises)
          for (let i = 0; i < GENESIS_NFT_IDS.length;i ++) {
            if(nftOwners[i] === account) {
              setGenesisNftStatus(true);
              return;
            }
          }
          setGenesisNftStatus(false)
      }

      fetchGenesisInfo();
    },[account])

    useEffect( () => {
      async function fetchHappyCowInfo() {
          
          const contractInstance = new web3.eth.Contract(HappyCows.abi as AbiItem[], getHappyCowAddress());

          const promises = []
          for (let i = 0; i < HAPPY_COW_BREEDS.length;i ++) {
              promises.push(contractInstance.methods.ownerOf(i+1).call())
          }
          const nftOwners = await Promise.all(promises)
          const hcs = [false, false, false, false, false]; 
          for (let i = 0; i < HAPPY_COW_BREEDS.length;i ++) {
            if(nftOwners[i] === account) {
              hcs[HAPPY_COW_BREEDS[i]] = true;
            }
          }
          setHappyCowStatus(hcs)
      }

      fetchHappyCowInfo();
    },[account]) */

    useEffect( () => {
      async function fetchCowTokenInfo() {
          const contractInstance = new web3.eth.Contract(CowTokenABI as AbiItem[], getCowTokenAddress());
          const tokenAmount = await contractInstance.methods.balanceOf(account).call()
          setCowTokenAmount(fromWei(tokenAmount, "Gwei"));
      }

      fetchCowTokenInfo();
    },[account])

    return (
        <Page style={{
            backgroundImage: isDark ? `url(/images/cow/home-backgrounddark.png)` : `url(/images/cow/home-backgroundlight.png)`,
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',}}
        >
          <StyledHero>
            <Heading as="h1" size="lg" color="secondary" mb="20px" style={{color: isDark ? "white" : ''}}>
              My Farm Dashboard
            </Heading>
          </StyledHero>
          <CardContainer>
            <StaticCard title='MY MILKPOWER' value={milkPower.toString()}/>
            <StaticCard title='TOTAL MILKPOWER' value={gameMilkPower.toString()}/>
            <StaticCard title='MY MILK/DAY' value={milkPerDay.toString()}/>
            <LandCard title='MY LANDS' value={landAmount.toString()}/>
            <CattleCard title='MY COWS' value={cowAmount.toString()}/>
            <CattleCard title='MY BULLS' value={bullAmount.toString()}/>
            <GenesisCard title='GENESIS NFT' hasGenesisNft={genesisNftStatus}/>
            <HappyCowCard title='HAPPY COW' value={happyCowStatus}/>
            <StaticCard title='$COW IN WALLET' value={cowTokenAmount}/>
          </CardContainer>
        </Page>
    )
}

export default FarmDashboard
