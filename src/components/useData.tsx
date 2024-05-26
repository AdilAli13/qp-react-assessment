import { FC, useEffect, useState } from "react";
import { TodoResponse } from "./types";

const useData = <T,>(url: string, initialState: T) => {
  const [data, setData] = useState<T>(initialState);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`${url}`);
      const json: T = await res.json();
      const dataWithActive = {
        ...json,
        todos: (json as TodoResponse).todos.map((todo) => ({
          ...todo,
          active: true,
        })),
      };
      setData(dataWithActive);
    };
    fetchData();
  }, [url]);

  return { data, setData };
};

export default useData;
