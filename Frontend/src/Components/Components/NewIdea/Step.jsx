import {
  useEffect,
  useRef
} from "react";

const Step = ({ step, setSteps, ind, stepsLength }) => {
  const stepEleRef = useRef(null);
  const { value, checked, isNew } = step;
  const addStep = () => {
    setSteps(prev => {
      prev = prev.map(step => ({ ...step, isNew: false }));
      prev.splice(ind + 1, 0, {
        value : "New Step",
        checked : false,
        isNew : true
      });
      return prev;
    })
  }
  const removeStep = () => {
    setSteps(prev => {
      prev = prev.map(step => ({ ...step, isNew: false }));
      prev.splice(ind, 1);
      return prev;
    })
  }
  const stepChange = (e) => {
    setSteps(prev => {
      prev = prev.map(step => ({ ...step, isNew: false }));
      prev[ind].value = e.target.value;
      return prev;
    })
  }
  const checkboxClick = () => {
    let lastCheck = ind;
    if (checked) lastCheck = ind - 1;
    setSteps(prev => prev.map((_, index) => index <= lastCheck ? { ...prev[index], checked: true, isNew: false } : { ...prev[index], checked: false, isNew: false}));
  }
  useEffect(() => {
    if (isNew) {
      stepEleRef.current.focus();
      stepEleRef.current.setSelectionRange(0,value.length);
    }
  }, [isNew])
  return (
    <div>
      <div className={`${ind == 0 ? "hidden" : ""} w-2 h-24 rounded-full bg-gray-500 relative left-10`}></div>
      <div className="flex gap-3">
        <button
          onClick={addStep}
          type="button"
          className="h-7 w-7 rounded-full bg-gray-600 flex justify-center items-center text-xl"
        >
          <p>+</p>
        </button>
        <input
          onChange={checkboxClick}
          type="checkbox"
          checked={checked}
        />
        <input
          className="bg-transparent focus:outline-none w-32"
          type="text"
          value={value}
          onChange={stepChange}
          ref={stepEleRef}
        />
        <button
          onClick={removeStep}
          type="button"
          className={`h-7 w-7 rounded-full bg-gray-600 ${stepsLength > 2 ? "flex" : "hidden"} justify-center items-center text-xl`}
        >
          <p>-</p>
        </button>
      </div>
    </div>
  )
}

export default Step;