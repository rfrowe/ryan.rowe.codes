import React, {useState} from "react"
import {Box, Slider, Typography} from "@mui/material";
import CalculateIcon from '@mui/icons-material/Calculate';
import {css} from "@emotion/react";
import CubeRenderer from "./cubeRenderer";

const CubeCard = () => {
    const [cubeIndex, setCubeIndex] = useState(0)
    const [numCubes, setNumCubes] = useState(0)

    return (
        <Box css={theme => css({
            width: '50%',
            margin: theme.spacing('2em', 'auto'),
            canvas: {
                width: '100% !important',
                height: 'unset !important',
            },
        })}>
            <Box css={css({
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
            })}>
                <Typography
                    id='complexity-slider-label'
                    css={css({flexShrink: 0})}
                >
                    Complexity {cubeIndex}
                </Typography>
                <CalculateIcon css={theme => css({
                    margin: theme.spacing(0, 2),
                    flexShrink: '0',
                })}/>
                <Slider
                    step={1}
                    min={0}
                    max={numCubes - 1}
                    defaultValue={0}
                    onChange={(_, value) => setCubeIndex(value as number)}
                    aria-labelledby='complexity-slider-label'
                    valueLabelDisplay="auto"
                    marks />
            </Box>
            <CubeRenderer index={cubeIndex} onCubesLoaded={setNumCubes} />
        </Box>
    )
}

export default CubeCard
