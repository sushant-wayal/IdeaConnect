const Category = ({ category, setCategories, ind }) => {
  const removeCategory = () => setCategories((prev) => prev.filter((_, i) => i !== ind));
  return (
    <div className="max-w-full bg-gray-600 p-2 rounded-2xl relative">
      <p className="w-full text-wrap">{category}</p>
      <div
        className="h-5 w-5 rounded-full flex justify-center items-center absolute top-[-5px] right-[-5px] bg-black text-gray-600 cursor-pointer"
        onClick={removeCategory}
      >
        <p>x</p>
      </div>
    </div>
  )
};

export default Category;