

const Search = ({searchKey, setSearchKey}) => {
  return (
    <div className="relative p-6 border-b border-gray-100 hidden md:block">
        <input type="text" 
            className="w-full h-11 pl-12 pr-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e74c3c]/30 focus:border-[#e74c3c] transition-all text-sm" 
            placeholder="Search messages or users..."
            value={searchKey}
            onChange={(e) => setSearchKey(e.target.value)} />
        <i className="fa fa-search absolute left-10 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true"></i>
    </div>
  )
}

export default Search