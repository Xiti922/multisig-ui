import { useEffect, useState } from "react"
import { getValidators } from "../../../libs/validators"
import Input from "../../input/Input"
import ShareForm from "./ShareForm"
import { createDelegateMsg } from "../../../libs/transaction"
import { openLoadingNotification, openNotification } from "../../ulti/Notification"
import axios from "axios"

const style = {
    input: {
        marginBottom: '10px',
        color: 'black'
    }
}

const DelegateMsg = ({ chain, router, address }) => {
    const [validators, setValidators] = useState([])
    const [txBody, setTxBody] = useState({
        toAddress: '',
        amount: 0,
        gas: 20000,
        fee: 0,
        memo: '',
    })

    const invalidForm = () => {
        for (let key in txBody) {
            if (key !== 'memo' && txBody[key] === '') return true
            else if (key === 'amount' && txBody[key] === 0) return true
        }
        return false
    }

    const disabled = () => {
        if (invalidForm()) {
            return true
        }
        return false
    }

    useEffect(() => {
        (async () => {
            try {
                const res = await getValidators(chain.rpc)
                res.validators && setValidators([...res.validators])
            }
            catch (e) {
                openNotification('error', e.message)
            }
        })()
    }, [chain])

    const handleCreate = async () => {
        openLoadingNotification('open', 'Creating transaction')
        try {
            const tx = createDelegateMsg(
                address,
                txBody.toAddress,
                txBody.amount * 1000000,
                txBody.gas,
                chain.denom,
                txBody.memo,
                chain.chain_id,
                txBody.fee,

            );
            const dataJSON = JSON.stringify(tx);
            const data = {
                dataJSON,
                createBy: address,
                status: 'PENDING'
            }
            const res = await axios.post("/api/transaction/create", data);
            const { _id } = res.data;
            router.push(`/multisig/${address}/transaction/${_id}`)
            openLoadingNotification('close')
            openNotification('success', 'Created successfully')
        }
        catch (e) {
            openLoadingNotification('close')
            openNotification('error', e.message)
        }
    }

    const handleKeyGroupChange = (e) => {
        if (e.target.name === 'amount' || e.target.name === 'fee' || e.target.name === 'gas') {
            setTxBody({
                ...txBody,
                [e.target.name]: parseFloat(e.target.value)
            })
        }
        else {
            setTxBody({
                ...txBody,
                [e.target.name]: e.target.value
            })
        }
    }

    const handleSelect = (e) => {
        setTxBody({
            ...txBody,
            toAddress: e.target.value
        })
    }

    return (
        <div>
            <div
                style={style.input}
            >
                <h4
                    style={{
                        marginBottom: 0
                    }}
                >
                    Validator
                </h4>
                <select
                    onChange={handleSelect}
                    style={{
                        width: '100%',
                        padding: '1em',
                        borderRadius: '10px',
                    }}
                >
                    {
                        validators.length > 0 && validators.map((validator, index) => {
                            return (
                                <option
                                    value={validator.operatorAddress}
                                    key={index}
                                >
                                    {validator.description.moniker}
                                </option>
                            )
                        })
                    }
                </select>

            </div>
            <Input
                onChange={(e) => {
                    handleKeyGroupChange(e);
                }}
                value={txBody.amount}
                label={`Amount (${chain.denom.split('u')[1].toUpperCase()})`}
                name="amount"
                type="number"
                placeholder="Amount"
                style={style.input}
            />
            <ShareForm
                txBody={txBody}
                handleKeyGroupChange={(e) => {
                    handleKeyGroupChange(e);
                }}
                handleCreate={handleCreate}
                chain={chain}
                style={style}
                disabled={disabled()}
            />
        </div>
    )
}

export default DelegateMsg