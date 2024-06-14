import axios from "axios";

export const headers = {
  Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
}

const getData = async (url) => {
  const { data : { data } } = await axios.get(`http://localhost:3000/api/v1${url}`, { headers });
  return data;
}

export const fecthData = async () => {
  const { data } = await axios.get("https://restcountries.com/v3/all");
  let countries = [];
  data.forEach(country => {
    countries.push(country.name.common);
  })
  countries = countries.sort();
  return countries;
}

export const getFeed = async () => await getData("/users/feed");

import { getChats } from "./Pages/Chats";
export { getChats };

export const getMyIdeas = async () => await getData("/ideas/myIdeas");
export const getExploreIdeas = async () => await getData("/ideas/exploreIdeas");
export const getCollaboratedIdeas = async () => await getData("/ideas/collaboratedIdeas");
export const getIntrestedIdeas = async () => await getData("/ideas/intrestedIdeas");