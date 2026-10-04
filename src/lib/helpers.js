import React,{useState,useEffect,useContext,createContext} from 'react';
import {$} from '../data/catalog.js';
const h=React.createElement,C=createContext();
const go=t=>{location.hash=t},A=(to,p,...c)=>h('a',{href:'#'+to,...p},...c);
function useLS(k,d){const[v,s]=useState(()=>{try{const x=JSON.parse(localStorage.getItem(k));return x??d}catch{return d}});useEffect(()=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}},[k,v]);return[v,s]}
function useHash(){const[s,set]=useState(location.hash.slice(1)||'/');useEffect(()=>{const f=()=>{set(location.hash.slice(1)||'/');scrollTo(0,0)};addEventListener('hashchange',f);return()=>removeEventListener('hashchange',f)},[]);return s}
export {React,h,C,$,go,A,useLS,useHash,useState,useEffect,useContext};
