import FlexRow from "./flex_box/FlexRow"
import Button from "./input/Button"
import { GithubFilled, TwitterOutlined, GlobalOutlined } from "@ant-design/icons"

const style = {
    button: {
        border: 0,
        backgroundColor: "transparent",
        fontSize: "1.5rem",
        color: "white"
    },
}

const Footer = () => {
    return (
        <div
            style={{
                backgroundColor: "#2b2b2b",
                padding: "2em 30em",
                marginTop: "70px",
                color: "white",
            }}
        >
            <FlexRow
                components={[
                    <FlexRow
                        components={[
                            <Button
                                style={style.button}
                                text={(
                                    <GithubFilled style={{}}/>
                                )}
                                type={"a"}
                                url={"https://github.com/notional-labs/"}
                                index={0}
                            />,
                            <Button
                                style={style.button}
                                text={(
                                    <TwitterOutlined />
                                )}
                                type={"a"}
                                url={"https://twitter.com/notionaldao"}
                                index={1}
                            />,
                            <Button
                                style={style.button}
                                text={(
                                    <GlobalOutlined />
                                )}
                                type={"a"}
                                url={"https://notional.ventures/"}
                                index={2}
                            />
                        ]}
                        style={{
                            width: "150px"
                        }}
                        justifyContent={"space-between"}
                        index={0}
                    />,
                    <text
                        style={{
                            fontSize: "1rem",
                            fontWeight: 400,
                            position: "relative",
                            color: "#dedede",
                            top: "5px"
                        }}
                        key={1}
                    >
                        © Powered By Notional
                    </text>
                ]}
                justifyContent={"space-between"}
            />
        </div>
    )
}

export default Footer