import { useState } from "react";
import { useEffect } from "react";
export default function Dashboard() {
    const [folders, setFolders] = useState([])
    const [id, setId] = useState(0)
    const [opened, setOpened] = useState(false)
    // const [currentInspection, setCurrentInspection]=useState(1)
    const [outputImages, setOutputImages] = useState([])
    const URL = "http://localhost:5000"
    const loadImages = async (folder) => {
        try {
            const res = await fetch(`${URL}/list?id=${folder}`);
            const data = await res.json();
            console.log("Fetched images:", data);

            setOutputImages(data.outputImages);  // use the correct key
            setOpened(true);
        } catch (error) {
            console.error("Error fetching images:", error);
        }
    };

    useEffect(() => {
        fetch('http://localhost:5000/folders')
            .then(res => res.json())
            .then(data => { setFolders(data.folders); console.log(data) })
            .catch(err => console.error('Error fetching folders:', err));
    }, []);

    return (
        <div className="w-full h-full flex flex-col basic p-4 overflow-auto">
            <p className="text-3xl">Dashboard</p>
            <div className="h-bar" />
            {opened ? <div className="flex flex-col p-4">
                {
                    outputImages && outputImages.map((image, i) => <div key={i} className="w-full max-h-64 flex justify-center items-center basic my-4">
                        <img className="w-1/3 object-cover h-full" src={`${URL}/output-images/${id}/${image}`} alt={image} />
                        <div className="w-2/3 h-full flex flex-col">
                            <div className="w-full h-3/4 flex">
                                <span className="w-1/3 h-full flex flex-col">
                                    <span className="flex flex-col w-full h-full">
                                        <p className="text-xs">STATUS</p>
                                        <p className="text-7xl">SAFE</p>
                                    </span>
                                    <span className="flex flex-col w-full h-full">
                                        <p className="text-xs">COORDINATES</p>
                                        <p className="text-7xl">20,88</p>
                                    </span>
                                </span>
                                <span className="w-1/3 h-full flex flex-col">
                                    <p className="text-xs">CONFIDENCE</p>

                                </span>
                            </div>
                            <div className="w-full">REPORT</div>
                        </div>
                    </div>)
                }
            </div> : <div className="flex flex-col p-4">
                {
                    folders.length === 0 ? <p className="self-center">No datasets uploaded yet!</p> :
                        (
                            folders.map(folder => <button key={folder} className="w-full max-h-64 p-4 flex justify-center items-center basic my-4" onClick={() => {
                                setId(folder)
                                loadImages(folder)

                            }}>
                                <span className="w-1/4 h-full justify-center items-center flex flex-col">
                                    <p>Session id: {folder}</p>
                                    <p>Date & Time: </p>
                                    <p>No. of inspections: </p>
                                    <button className="button">View Details</button>
                                </span>
                            </button>)
                        )
                }
            </div>}
        </div>
    );
}