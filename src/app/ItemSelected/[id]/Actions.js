"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

const Actions = () => {
  const { id } = useParams();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/getFruitDetails?fruit_name=${id}`);
        const response = await res.json();
        setData(response);
      } catch (error) {
        console.error("Error fetching images:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  return (
    <div className="flex flex-col gap-5 items-center justify-center h-svh bg-black">
      <Link className="text-white" href={"/"}>
        Back
      </Link>
      {data && (
        <div className="cardComponent">
          <h1>{id}</h1>

          {data.image && (
            <Image
              src={data.image}
              alt="Image"
              width={250}
              height={250}
              className={""}
            />
          )}

          <div className="text-left">
            <h1 className="flex gap-1">
              <p className="font-bold">Calories:</p> {data.nutrition?.calories}{" "}
              {data.nutrition?.unit}
            </h1>
            <h1 className="flex gap-1">
              <p className="font-bold">Carbs:</p> {data.nutrition?.carbs}{" "}
              {data.nutrition?.unit}
            </h1>
            <h1 className="flex gap-1">
              <p className="font-bold">Fat:</p> {data.nutrition?.fat}{" "}
              {data.nutrition?.unit}
            </h1>
            <h1 className="flex gap-1">
              <p className="font-bold">Protein:</p> {data.nutrition?.protein}{" "}
              {data.nutrition?.unit}
            </h1>
          </div>
        </div>
      )}
    </div>
  );
};

export default Actions;
