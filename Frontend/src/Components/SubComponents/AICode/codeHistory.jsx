import { House, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { getData } from "../../../dataLoaders";
import { useEffect, useState } from "react";

const CodeHistory = ({ codes, setCodes, setCodeId, setCodeTitle, setPrevCodeId, className }) => {
  const [codeSearch, setCodeSearch] = useState("");
  useEffect(() => {
    const fetchCodes = async () => {
      let { codes : userCodes } = await getData("/codes/", "get", true);
      console.log("userCodes :", userCodes);
      userCodes = userCodes.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
      console.log("userCodes :", userCodes);
      setCodes(userCodes);
      // setCodes(prev => prev.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified)));
    }
    fetchCodes();
  }, []);
  useEffect(() => {
    const toSearch = codeSearch.trim().replace(/ +/g," ").toLowerCase();
    if (toSearch.length == 0) setCodes(codes);
    else {
      setCodes(codes.filter(code => {
        return code.title.toLowerCase().includes(toSearch);
      }));
  };
  },[codeSearch, codes])
  return (
    <div className={`bg-[#797270] h-full w-72 rounded-2xl flex flex-col p-2 overflow-y-scroll overflow-x-hidden ${className}`}>
      <div className="border-b-2 border-black border-solid pb-1 flex justify-between items-center">
        <Link
          to="/ideas"
          className="hover:bg-[#B0C0BC] p-1 rounded-full bg-[#C1EDCC]"
        >
          <House/>
        </Link>
        <p className="text-xl font-semibold">
          Codes
        </p>
        <div className="rounded-full relative">
          <input
            value={codeSearch}
            onChange={(e) => setCodeSearch(e.target.value)}
            placeholder="Search Codes"
            className="rounded-full w-40 bg-[#C1EDCC] pl-8 placeholder:text-black/90 text-black"
            type="search"
          />
          <p className="absolute top-1/2 -translate-y-1/2 left-2">🔎</p>
        </div>
      </div>
      <div onClick={() => setCodeId((prev) => {
        setPrevCodeId(prev);
        return null;
      })} className="flex w-full rounded-2xl justify-start items-center px-2 mt-3 bg-[#C1EDCC] hover:bg-[#B0C0BC] cursor-pointer">
        <Plus className="w-10 h-10"/>
        <p className="text-lg font-semibold text-center">New Code</p>
      </div>
      <div className={`flex flex-col gap-2 py-2 w-full h-full ${codes.length == 0 ? "justify-center items-center" : ""}`}>
        {codes.length > 0 ?
          codes.map(({ id, title }) => (
            <div key={id} onClick={() => {
              setCodeId((prev) => {
                setPrevCodeId(prev);
                return id;
              });
              setCodeTitle(title);
            }} className="bg-[#908D8D] rounded-2xl cursor-pointer flex justify-between items-center relative hover:bg-[#A7A7A9] p-2">
              {title}
            </div>
          ))
          :
          <p className="text-3xl">No Codes Found</p>
        }
      </div>
    </div>
  );
};

export default CodeHistory;