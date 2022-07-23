import { useState, useEffect, useContext, useCallback } from "react"
import { getAllMultisigByAddress } from "../../libs/multisig"
import MultisigRowView from "../data_view/MultisigRowView"
import { ChainContext } from "../Context"
import { getKey } from "../../libs/keplrClient"
import ButtonList from "../input/ButtonList"
import { idToChainId } from "../../data/chainData"
import { motion } from "framer-motion"
import FlexRow from "../flex_box/FlexRow"
import Button from "../input/Button"
import { ReloadOutlined } from "@ant-design/icons";
import { openNotification } from "../ulti/Notification"
import EmptyPage from "../ulti/EmptyPage"

const MultisigList = () => {
    const [multisigs, setMultisigs] = useState([])
    const [viewMultsigi, setViewMultisig] = useState([])
    const [params, setParams] = useState({
        page: 1,
        limit: 5,
        total: 0,
    })
    const [loading, setLoading] = useState(false)
    const [toggleReload, setToggleReload] = useState(false)
    const { chain } = useContext(ChainContext)

    const keplrKeystorechangeListener = useCallback(async (event) => {
        try {
            setLoading(true)
            const account = await getKey(chain.chain_id)
            const address = account.bech32Address
            const res = await getAllMultisigOfAddress(address)
            setMultisigs([...res])
            setLoading(false)
        }
        catch (e) {
            alert(e.message)
        }
    }, []);

    const storageListener = useCallback(async (event) => {
        try {
            const account = localStorage.getItem("account")
            const address = account && JSON.parse(account).bech32Address || ""
            if (address === "") {
                setLoading(false)
                setMultisigs([])
                return
            }
            const res = await getAllMultisigOfAddress(address)
            setMultisigs([...res])
            setParams({ ...params, total: res.length })
            setLoading(false)
        }
        catch (e) {
            alert(e.message)
        }
    }, []);

    const chainChangedListener = useCallback(async (event) => {
        try {
            setLoading(true)
            const currentId = localStorage.getItem("current")
            const chainId = idToChainId[currentId]
            const account = await getKey(chainId)
            const address = account.bech32Address
            const res = await getAllMultisigOfAddress(address)
            setMultisigs([...res])
            setParams({ ...params, total: res.length })
            setLoading(false)
        }
        catch (e) {
            alert(e.message)
        }
    }, []);

    useEffect(() => {
        window.keplr && window.addEventListener("keplr_keystorechange", keplrKeystorechangeListener)

        window.addEventListener("storage", storageListener)

        window.addEventListener("chain_changed", chainChangedListener)

        return () => {
            window.keplr && window.removeEventListener("keplr_keystorechange", keplrKeystorechangeListener)

            window.removeEventListener("storage", storageListener)

            window.removeEventListener("chain_changed", chainChangedListener)
        }
    }, []);

    useEffect(() => {
        (async () => {
            try {
                setLoading(true)
                const account = localStorage.getItem("account")
                const address = account && JSON.parse(account).bech32Address || ""
                if (address === "") {
                    setLoading(false)
                    return
                }
                const res = await getAllMultisigOfAddress(address)
                setMultisigs([...res])
                setParams({ ...params, total: res.length, page: 1 })
                setLoading(false)
            }
            catch (e) {
                setLoading(false)
                openNotification("error", "Cant fetch multisigs list " + e.message)
            }
        })()
    }, [toggleReload])

    useEffect(() => {
        const pagingList = multisigs.slice((params.page - 1) * params.limit, params.page * params.limit)
        setViewMultisig([...pagingList])
    }, [params, multisigs])

    const wrapSetParams = (index) => {
        setParams({ ...params, page: index })
    }

    return (
        <div
            style={{
                padding: "1em 2em",
                display: "flex",
                justifyContent: "space-between",
                flexDirection: "column",
                backgroundColor: "#ffffff",
                width: "100%",
                borderRadius: "30px",
                position: "relative",
                zIndex: 3,
                boxShadow: "0px 0px 20px 2px rgba(0, 0, 0, 0.25)",
                minHeight: "65vh"
            }}
        >
            <div>
                <FlexRow
                    components={[
                        <h1
                            style={{
                                textAlign: "left",
                            }}
                        >
                            Multisigs
                        </h1>,
                        <Button
                            text={(
                                <div>
                                    <ReloadOutlined
                                        spin={loading}
                                    /> Update
                                </div>
                            )}
                            style={{
                                position: "relative",
                                top: "5px",
                                color: "white",
                                backgroundColor: "rgb(0, 0, 0, 0.5)",
                                borderRadius: "10px",
                                border: 0,
                                height: "40px",
                                padding: "0 2em",
                            }}
                            clickFunction={() => {
                                setToggleReload(!toggleReload)
                            }}
                        />
                    ]}
                    justifyContent={"space-between"}
                />
                <table
                    style={{
                        width: "100%",
                        borderSpacing: "0 1em",
                    }}
                >
                    <thead
                        style={{
                            borderBottom: "solid 1.25px black",
                            fontSize: "1.25rem"
                        }}
                    >
                        <tr>
                            <th
                                style={{
                                    width: "50%",
                                    padding: ".5em",
                                    textAlign: "left"
                                }}
                            >
                                Address
                            </th>
                            <th
                                style={{
                                    width: "30%",
                                    padding: ".5em",
                                    textAlign: "left"
                                }}
                            >
                                Components
                            </th>
                            <th
                                style={{
                                    width: "20%",
                                    padding: ".5em",
                                    textAlign: "center"
                                }}
                            >
                                Threshold
                            </th>
                        </tr>
                    </thead>
                    <motion.tbody
                        animate={{
                            transition: {
                                staggerChildren: 0.1
                            }
                        }}
                    >
                        {
                            !loading ? viewMultsigi.map((multisig, index) => {
                                return (
                                    <MultisigRowView
                                        address={multisig.address}
                                        index={index}
                                        chain={chain}
                                    />
                                )
                            }) : (
                                <MultisigRowView
                                    loadingRow={true}
                                />
                            )
                        }
                    </motion.tbody >
                </table>
                {
                    !loading && viewMultsigi.length === 0 && (
                        <EmptyPage
                            description={(
                                <>
                                    <div>
                                        No multisigs found
                                    </div>
                                    <div>
                                        Either connect your keplr wallet or create a new multisig
                                    </div>
                                </>
                            )}
                            addButton={true}
                            button={(
                                <Button
                                    text={"Create now"}
                                    type={"link"}
                                    url={"/multisig/create"}
                                    style={{
                                        borderRadius: "10px",
                                        border: 0,
                                        padding: ".5em 1em",
                                        backgroundColor: "black",
                                        color: "white"
                                    }}
                                />
                            )}
                        />
                    )
                }
            </div>
            {
                params.total > 0 && (
                    <ButtonList
                        currentPage={params.page}
                        total={Math.ceil(params.total / params.limit)}
                        wrapSetParams={wrapSetParams}
                    />
                )
            }
        </div>
    )
}

export default MultisigList
