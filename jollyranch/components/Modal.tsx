import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AiOutlineCloseCircle } from 'react-icons/ai'

export default ({ isToggled, setToggled, children }) => {
  return (
    <AnimatePresence>
      {isToggled && (
        <>
          <div className="bg-[#141313b9] w-full h-full block absolute top-0 left-0 z-[99]" />
          <motion.div
            initial={{ y: 10, x: "-50%", opacity: 0 }}
            animate={{ y: 50, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="absolute top-0 left-[50%] z-[9999] flex flex-col justify-center items-center w-[80%] max-h-full overflow-y-auto p-4 pt-10"
            style={{ transform: "translate3d(-50%, 0, 0)" }}
          >
            {children}
            <motion.button
            whileHover={{scale: 1.1}}
            whileTap={{scale: 0.8}}
            transition={{duration: 0.2}}
              className="bg-transparent my-4 rounded-[3px] z-[9999] text-[#bb2222] mx-[0.25rem] text-4xl font-archivoBlack cursor-pointer hover:bg-[#bb2222] hover:rounded-full hover:text-white fixed md:right-[5rem] -top-4 right-0"
              onClick={setToggled}
            >
              <AiOutlineCloseCircle/>
            </motion.button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
