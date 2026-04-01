"""
Utility script to inspect the saved model checkpoint.
Run: python backend/model_info.py
"""
import torch
import os

MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "trained_model_weights.pth")

def inspect_model():
    print(f"Loading checkpoint from: {MODEL_PATH}")
    checkpoint = torch.load(MODEL_PATH, map_location="cpu", weights_only=False)
    
    print(f"\nType: {type(checkpoint)}")
    
    if isinstance(checkpoint, dict):
        print(f"Top-level keys: {list(checkpoint.keys())}")
        
        # Find the state dict
        if "state_dict" in checkpoint:
            sd = checkpoint["state_dict"]
        elif "model_state_dict" in checkpoint:
            sd = checkpoint["model_state_dict"]
        else:
            sd = checkpoint
        
        keys = list(sd.keys())
        print(f"\nTotal parameter keys: {len(keys)}")
        print(f"\nFirst 10 keys: {keys[:10]}")
        print(f"\nLast 5 keys: {keys[-5:]}")
        
        # Try to determine output classes from last layer
        for k in reversed(keys):
            if "weight" in k:
                shape = sd[k].shape
                print(f"\nLast weight layer '{k}': shape={shape}")
                if len(shape) == 2:
                    print(f"  → Likely output classes: {shape[0]}")
                break
        
        # Print other metadata
        for k, v in checkpoint.items():
            if k not in ("state_dict", "model_state_dict") and not isinstance(v, dict):
                print(f"\nMetadata '{k}': {v}")
    
    elif hasattr(checkpoint, "state_dict"):
        print(f"Full model object: {checkpoint.__class__.__name__}")
    else:
        print(f"Unknown format: {checkpoint}")

if __name__ == "__main__":
    inspect_model()
