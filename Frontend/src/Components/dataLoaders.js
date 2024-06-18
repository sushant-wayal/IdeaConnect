import axios from "axios";

export const headers = {
  headers: {
    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
  }
}

const backendUrl = "http://localhost:3000/api/v1";

export const getData = async (url, request, authorized) => {
  url = `${backendUrl}${url}`
  if (authorized) {
    if (request == "get") {
      const { data : { data } } = await axios.get(url, headers);
      return data;
    } else if (request == "post") {
      const { data : { data } } = await axios.post(url, headers);
      return data;
    } else if (request == "put") {
      const { data : { data } } = await axios.put(url, headers);
      return data;
    } else if (request == "delete") {
      const { data : { data } } = await axios.delete(url, headers);
      return data;
    } else if (request == "patch") {
      const { data : { data } } = await axios.patch(url, headers);
      return data;
    } else if (request == "options") {
      const { data : { data } } = await axios.options(url, headers);
      return data;
    } else if (request == "head") {
      const { data : { data } } = await axios.head(url, headers);
      return data;
    } else return "Invalid Request"; 
  } else {
    if (request == "get") {
      const { data : { data } } = await axios.get(url);
      return data;
    } else if (request == "post") {
      const { data : { data } } = await axios.post(url);
      return data;
    } else if (request == "put") {
      const { data : { data } } = await axios.put(url);
      return data;
    } else if (request == "delete") {
      const { data : { data } } = await axios.delete(url);
      return data;
    } else if (request == "patch") {
      const { data : { data } } = await axios.patch(url);
      return data;
    } else if (request == "options") {
      const { data : { data } } = await axios.options(url);
      return data;
    } else if (request == "head") {
      const { data : { data } } = await axios.head(url);
      return data;
    } else return "Invalid Request";
  }
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

export const getFeed = async () => await getData("/users/feed", "get", true);

import { getChats } from "./Pages/Chats";
export { getChats };

export const getMyIdeas = async () => await getData("/ideas/myIdeas", "get", true);
export const getExploreIdeas = async () => await getData("/ideas/exploreIdeas", "get", true);
export const getCollaboratedIdeas = async () => await getData("/ideas/collaboratedIdeas", "get", true);
export const getIntrestedIdeas = async () => await getData("/ideas/intrestedIdeas", "get", true);