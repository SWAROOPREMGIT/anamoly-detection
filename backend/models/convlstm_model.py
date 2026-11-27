"""
ConvLSTM model architecture for video-based anomaly detection.

This module defines a Convolutional LSTM (ConvLSTM2D) model that processes
sequences of video frames to classify them into one of four categories:
Normal Activity, Fight, Fall, or Intrusion.
"""

from typing import Tuple

import numpy as np


def build_convlstm_model(
    sequence_length: int = 16,
    image_size: int = 64,
    num_channels: int = 3,
    num_classes: int = 4,
) -> "tensorflow.keras.Model":
    """
    Build and compile a ConvLSTM2D-based model for video classification.

    Architecture:
        - ConvLSTM2D (64 filters, 3x3 kernel) → BatchNorm → MaxPool3D
        - ConvLSTM2D (32 filters, 3x3 kernel) → BatchNorm → MaxPool3D
        - ConvLSTM2D (16 filters, 3x3 kernel) → BatchNorm
        - GlobalAveragePooling → Dense(128) → Dropout → Dense(num_classes, softmax)

    Args:
        sequence_length: Number of frames in each input sequence.
        image_size: Height and width of each frame (square).
        num_channels: Number of color channels (3 for RGB).
        num_classes: Number of output classes.

    Returns:
        A compiled Keras Model ready for training or inference.
    """
    import tensorflow as tf
    from tensorflow.keras import layers, models

    input_shape: Tuple[int, int, int, int] = (
        sequence_length,
        image_size,
        image_size,
        num_channels,
    )

    model = models.Sequential(name="ConvLSTM_AnomalyDetector")

    # --- Block 1: ConvLSTM2D + BatchNorm + MaxPool ---
    model.add(
        layers.ConvLSTM2D(
            filters=64,
            kernel_size=(3, 3),
            padding="same",
            return_sequences=True,
            activation="tanh",
            recurrent_activation="sigmoid",
            input_shape=input_shape,
            name="convlstm2d_1",
        )
    )
    model.add(layers.BatchNormalization(name="batchnorm_1"))
    model.add(
        layers.MaxPooling3D(
            pool_size=(1, 2, 2),
            name="maxpool3d_1",
        )
    )

    # --- Block 2: ConvLSTM2D + BatchNorm + MaxPool ---
    model.add(
        layers.ConvLSTM2D(
            filters=32,
            kernel_size=(3, 3),
            padding="same",
            return_sequences=True,
            activation="tanh",
            recurrent_activation="sigmoid",
            name="convlstm2d_2",
        )
    )
    model.add(layers.BatchNormalization(name="batchnorm_2"))
    model.add(
        layers.MaxPooling3D(
            pool_size=(1, 2, 2),
            name="maxpool3d_2",
        )
    )

    # --- Block 3: ConvLSTM2D + BatchNorm ---
    model.add(
        layers.ConvLSTM2D(
            filters=16,
            kernel_size=(3, 3),
            padding="same",
            return_sequences=False,
            activation="tanh",
            recurrent_activation="sigmoid",
            name="convlstm2d_3",
        )
    )
    model.add(layers.BatchNormalization(name="batchnorm_3"))

    # --- Classification Head ---
    model.add(layers.Flatten(name="flatten"))
    model.add(layers.Dense(128, activation="relu", name="dense_1"))
    model.add(layers.Dropout(0.5, name="dropout_1"))
    model.add(layers.Dense(64, activation="relu", name="dense_2"))
    model.add(layers.Dropout(0.3, name="dropout_2"))
    model.add(layers.Dense(num_classes, activation="softmax", name="output"))

    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-4),
        loss="categorical_crossentropy",
        metrics=["accuracy"],
    )

    return model


def get_model_summary_dict(
    sequence_length: int = 16,
    image_size: int = 64,
    num_channels: int = 3,
    num_classes: int = 4,
) -> dict:
    """
    Return a dictionary describing the model architecture without building it.

    Useful for the analytics endpoint when the model is not loaded.
    """
    return {
        "name": "ConvLSTM_AnomalyDetector",
        "type": "Convolutional LSTM (ConvLSTM2D)",
        "framework": "TensorFlow / Keras",
        "input_shape": [sequence_length, image_size, image_size, num_channels],
        "output_classes": num_classes,
        "layers": [
            {"name": "convlstm2d_1", "type": "ConvLSTM2D", "filters": 64, "kernel": "3x3"},
            {"name": "batchnorm_1", "type": "BatchNormalization"},
            {"name": "maxpool3d_1", "type": "MaxPooling3D", "pool": "1x2x2"},
            {"name": "convlstm2d_2", "type": "ConvLSTM2D", "filters": 32, "kernel": "3x3"},
            {"name": "batchnorm_2", "type": "BatchNormalization"},
            {"name": "maxpool3d_2", "type": "MaxPooling3D", "pool": "1x2x2"},
            {"name": "convlstm2d_3", "type": "ConvLSTM2D", "filters": 16, "kernel": "3x3"},
            {"name": "batchnorm_3", "type": "BatchNormalization"},
            {"name": "flatten", "type": "Flatten"},
            {"name": "dense_1", "type": "Dense", "units": 128, "activation": "relu"},
            {"name": "dropout_1", "type": "Dropout", "rate": 0.5},
            {"name": "dense_2", "type": "Dense", "units": 64, "activation": "relu"},
            {"name": "dropout_2", "type": "Dropout", "rate": 0.3},
            {"name": "output", "type": "Dense", "units": num_classes, "activation": "softmax"},
        ],
        "optimizer": "Adam (lr=1e-4)",
        "loss": "categorical_crossentropy",
        "metrics": ["accuracy"],
    }
