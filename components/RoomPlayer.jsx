"use client";

import {
  useEffect,
  useRef,
} from "react";

import * as THREE from "three";

import {
  useFrame,
  useThree,
} from "@react-three/fiber";

import {
  PointerLockControls,
} from "@react-three/drei";

import {
  CapsuleCollider,
  RigidBody,
} from "@react-three/rapier";

/* ======================================================
   PLAYER BODY CONFIGURATION

   Capsule total height:

   halfHeight * 2
   +
   radius * 2

   0.50 * 2 + 0.35 * 2
   =
   1.70 meters
====================================================== */

const PLAYER_RADIUS =
  0.35;

const CAPSULE_HALF_HEIGHT =
  0.5;

/* center of capsule above floor */

const BODY_CENTER_HEIGHT =
  CAPSULE_HALF_HEIGHT +
  PLAYER_RADIUS;

/* eye position above body center */

const EYE_OFFSET =
  0.72;

/* reusable vectors to avoid allocations every frame */

const forwardVector =
  new THREE.Vector3();

const rightVector =
  new THREE.Vector3();

const movementVector =
  new THREE.Vector3();

/* ======================================================
   PLAYER
====================================================== */

export default function RoomPlayer({
  controlsRef,

  movementEnabled,

  cameraOwned,

  spawn = [
    0,
    0,
    3,
  ],

  lookAt = [
    0,
    1.4,
    0,
  ],

  speed = 2.5,
}) {
  const bodyRef =
    useRef(null);

  const keysRef =
    useRef({});

  const initializedRef =
    useRef(false);

  const {
    camera,
  } = useThree();

  /* ====================================================
     KEYBOARD STATE
  ==================================================== */

  useEffect(() => {
    function handleKeyDown(
      event
    ) {
      keysRef.current[
        event.code
      ] = true;
    }

    function handleKeyUp(
      event
    ) {
      keysRef.current[
        event.code
      ] = false;
    }

    function clearKeys() {
      keysRef.current = {};
    }

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    window.addEventListener(
      "keyup",
      handleKeyUp
    );

    window.addEventListener(
      "blur",
      clearKeys
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );

      window.removeEventListener(
        "keyup",
        handleKeyUp
      );

      window.removeEventListener(
        "blur",
        clearKeys
      );
    };
  }, []);

  /* ====================================================
     INITIAL CAMERA DIRECTION

     Happens only once.

     PLAYER_LOOK_AT determines where
     she is looking when entering.
  ==================================================== */

  useEffect(() => {
    if (
      !cameraOwned ||
      initializedRef.current
    ) {
      return;
    }

    camera.lookAt(
      new THREE.Vector3(
        lookAt[0],
        lookAt[1],
        lookAt[2]
      )
    );

    initializedRef.current =
      true;
  }, [
    camera,
    cameraOwned,
    lookAt,
  ]);

  /* ====================================================
     PLAYER UPDATE
  ==================================================== */

  useFrame(() => {
    const body =
      bodyRef.current;

    if (!body) {
      return;
    }

    const bodyPosition =
      body.translation();

    /* --------------------------------------------------
       FIRST-PERSON CAMERA FOLLOWS CAPSULE
    -------------------------------------------------- */

    if (cameraOwned) {
      camera.position.set(
        bodyPosition.x,
        bodyPosition.y +
          EYE_OFFSET,
        bodyPosition.z
      );
    }

    /*
     * DEV mode controls camera using OrbitControls.
     *
     * The physical player stays where she was.
     */

    if (!cameraOwned) {
      return;
    }

    const currentVelocity =
      body.linvel();

    /* --------------------------------------------------
       MENU OPEN:
       stop horizontal movement but preserve gravity
    -------------------------------------------------- */

    if (!movementEnabled) {
      body.setLinvel(
        {
          x: 0,

          y:
            currentVelocity.y,

          z: 0,
        },
        true
      );

      return;
    }

    /* --------------------------------------------------
       CAMERA FORWARD VECTOR
    -------------------------------------------------- */

    camera.getWorldDirection(
      forwardVector
    );

    /*
     * We don't want looking upward to make
     * the character fly upward.
     */

    forwardVector.y = 0;

    if (
      forwardVector.lengthSq() >
      0
    ) {
      forwardVector.normalize();
    }

    /* --------------------------------------------------
       CAMERA RIGHT VECTOR
    -------------------------------------------------- */

    rightVector
      .crossVectors(
        forwardVector,
        camera.up
      )
      .normalize();

    movementVector.set(
      0,
      0,
      0
    );

    /* --------------------------------------------------
       FORWARD
    -------------------------------------------------- */

    if (
      keysRef.current[
        "KeyW"
      ] ||
      keysRef.current[
        "ArrowUp"
      ]
    ) {
      movementVector.add(
        forwardVector
      );
    }

    /* --------------------------------------------------
       BACKWARD
    -------------------------------------------------- */

    if (
      keysRef.current[
        "KeyS"
      ] ||
      keysRef.current[
        "ArrowDown"
      ]
    ) {
      movementVector.sub(
        forwardVector
      );
    }

    /* --------------------------------------------------
       LEFT
    -------------------------------------------------- */

    if (
      keysRef.current[
        "KeyA"
      ] ||
      keysRef.current[
        "ArrowLeft"
      ]
    ) {
      movementVector.sub(
        rightVector
      );
    }

    /* --------------------------------------------------
       RIGHT
    -------------------------------------------------- */

    if (
      keysRef.current[
        "KeyD"
      ] ||
      keysRef.current[
        "ArrowRight"
      ]
    ) {
      movementVector.add(
        rightVector
      );
    }

    /* --------------------------------------------------
       NO MOVEMENT
    -------------------------------------------------- */

    if (
      movementVector.lengthSq() ===
      0
    ) {
      body.setLinvel(
        {
          x: 0,

          y:
            currentVelocity.y,

          z: 0,
        },
        true
      );

      return;
    }

    movementVector.normalize();

    /* --------------------------------------------------
       SPRINT
    -------------------------------------------------- */

    const sprinting =
      keysRef.current[
        "ShiftLeft"
      ] ||
      keysRef.current[
        "ShiftRight"
      ];

    const finalSpeed =
      sprinting
        ? speed * 1.55
        : speed;

    /* --------------------------------------------------
       PHYSICAL CHARACTER MOVEMENT

       Collision is now controlled by Rapier.
    -------------------------------------------------- */

    body.setLinvel(
      {
        x:
          movementVector.x *
          finalSpeed,

        y:
          currentVelocity.y,

        z:
          movementVector.z *
          finalSpeed,
      },
      true
    );
  });

  return (
    <>
      {/* =================================================
          PHYSICAL CHARACTER
      ================================================= */}

      <RigidBody
        ref={bodyRef}
        name="PLAYER"

        colliders={false}

        position={[
          spawn[0],

          spawn[1] +
            BODY_CENTER_HEIGHT,

          spawn[2],
        ]}

        enabledRotations={[
          false,
          false,
          false,
        ]}

        mass={70}

        friction={0}

        restitution={0}

        linearDamping={6}

        angularDamping={10}

        canSleep={false}

        /* prevents tunneling through thin walls */

        ccd
      >
        <CapsuleCollider
          args={[
            CAPSULE_HALF_HEIGHT,
            PLAYER_RADIUS,
          ]}
        />
      </RigidBody>

      {/* =================================================
          FIRST PERSON LOOK
      ================================================= */}

      <PointerLockControls
        ref={controlsRef}
        enabled={cameraOwned}
      />
    </>
  );
}