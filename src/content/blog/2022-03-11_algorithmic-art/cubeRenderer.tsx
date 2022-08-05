import React, {useEffect, useMemo} from "react";
import p5Types from "p5";
import loadable from "@loadable/component";
import {graphql, useStaticQuery} from "gatsby";
import {useTheme} from "@mui/material";

type RandomCubeData = Queries.RandomCubeImagesQuery['allFile']['nodes']
type Face = p5Types.Image
type Cube = [Face, Face, Face, Face, Face, Face]

const Sketch = loadable(() => import('react-p5'))
enum Faces {
    FRONT,
    BACK,
    BOTTOM,
    TOP,
    RIGHT,
    LEFT
}

const state = {
    background: 'transparent',
    cubes: {
        data: [] as Cube[],
        index: 0,
    },
    drag: {
        start: false,
        rate: 0.4,
    },
    rotation: {
        x: -22.5,
        y: 45,
    },
}

const setup = (p5: p5Types, canvasParentRef: Element) => {
    const canvas = p5.createCanvas(512, 512, p5.WEBGL).parent(canvasParentRef)
    canvas.mousePressed(() => state.drag.start = true)
    canvas.mouseReleased(() => state.drag.start = false)

    p5.textureMode(p5.NORMAL)
    p5.angleMode(p5.DEGREES)
}

const draw = (p5: p5Types) => {
    p5.background(state.background)
    p5.noStroke()
    drawFaceBox(p5)
}

function drawFaceBox(p5: p5Types) {
    const side = p5.width / 2
    const cube = state.cubes.data[state.cubes.index]

    p5.push()

    // Apply rotation.
    p5.translate(0, 0, -side / 2)
    p5.rotateX(state.rotation.x)
    p5.rotateY(state.rotation.y)
    p5.translate(0, 0, side / 2)

    // Center the box.
    p5.translate(-side / 2, -side / 2, 0)

    // Draw faces.
    p5.texture(cube[Faces.FRONT])
    p5.quad(0, 0, side, 0, side, side, 0, side)

    p5.push()
    p5.texture(cube[Faces.LEFT])
    p5.translate(0, 0, -side)
    p5.rotateY(-90)
    p5.quad(side, 0, 0, 0, 0, side, side, side)
    p5.pop()

    p5.push()
    p5.texture(cube[Faces.TOP])
    p5.translate(0, 0, -side)
    p5.rotateX(90)
    p5.quad(0, side, 0, 0, side, 0, side, side)
    p5.pop()

    p5.push()
    p5.texture(cube[Faces.RIGHT])
    p5.translate(side, 0, 0)
    p5.rotateY(90)
    p5.quad(0, 0, side, 0, side, side, 0, side)
    p5.pop()

    p5.push()
    p5.texture(cube[Faces.BOTTOM])
    p5.translate(0, side, 0)
    p5.rotateX(-90)
    p5.quad(0, 0, 0, side, side, side, side, 0)
    p5.pop()
    p5.push()

    p5.texture(cube[Faces.BACK])
    p5.rotateY(180)
    p5.translate(-side, 0, side)
    p5.quad(side, 0, 0, 0, 0, side, side, side)
    p5.pop()

    p5.pop()
}

function getPreloader(data: RandomCubeData, setNumCubes: (cubes: number) => void) {
    return (p5: p5Types) => {
        const cube: Face[] = []

        state.cubes.data.splice(0)
        data.forEach(image => {
            if (cube.length == 6) {
                state.cubes.data.push(cube.splice(0) as Cube)
            }
            cube.push(p5.loadImage(image.publicURL as string))
        })
        state.cubes.data.push(cube.splice(0) as Cube)

        setNumCubes(state.cubes.data.length)
    }
}

function mouseDragged(p5: p5Types) {
    if (!state.drag.start) {
        return
    }

    state.rotation.x += (p5.pmouseY - p5.mouseY) * state.drag.rate
    state.rotation.y += (p5.mouseX - p5.pmouseX) * state.drag.rate
}

interface Props {
    index: number
    onCubesLoaded: (count: number) => void
}

const CubeRenderer = ({index, onCubesLoaded}: Props) => {
    const data = useStaticQuery<Queries.RandomCubeImagesQuery>(graphql`
        query RandomCubeImages {
            allFile(
                filter: {dir: {regex: "/content/blog/2022-03-11_algorithmic-art/assets/.*/"}, extension: {eq: "jpg"}}
                sort: {fields: [dir, name]}
            ) {
                nodes {
                    dir
                    name
                    publicURL
                }
            }
        }
    `)

    useEffect(() => {state.cubes.index = index}, [index])

    const preload = useMemo(() => {
        return getPreloader(data.allFile.nodes, onCubesLoaded)
    }, [data])

    const {palette: {background: {default: background}}} = useTheme()
    useEffect(() => {state.background = background}, [background])

    return (
        <Sketch
            setup={setup}
            draw={draw}
            preload={preload}
            mouseDragged={mouseDragged}
            mouseReleased={() => state.drag.start = false}
        />
    )
}

export default CubeRenderer
