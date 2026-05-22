import math
import re
import os
import numpy as np 
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import padding
from base64 import b64encode, b64decode
from flask import Flask, request, jsonify, send_from_directory # <-- ADDED send_from_directory
from flask_cors import CORS 
# RSA Imports
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import padding as rsa_padding
from cryptography.exceptions import InvalidSignature

# ----------------------------------------------------
# 1. Shared Helper Functions and Constants
# ----------------------------------------------------

ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
BACKEND = default_backend()

# Helper function for Modular Multiplicative Inverse (needed for Hill Decryption)
def mod_inverse(a, m):
    """Finds the modular multiplicative inverse of a mod m."""
    a = a % m
    for x in range(1, m):
        if (a * x) % m == 1:
            return x
    return None 

# ----------------------------------------------------
# 2. Classical Ciphers (Working Implementations)
# ----------------------------------------------------

# --- Caesar ---
def caesar_encrypt(text, shift):
    result = ""
    # ... (implementation omitted for brevity - assuming it's correct)
    for char in text:
        if 'A' <= char <= 'Z':
            result += chr((ord(char) - ord('A') + shift) % 26 + ord('A'))
        elif 'a' <= char <= 'z':
            result += chr((ord(char) - ord('a') + shift) % 26 + ord('a'))
        else:
            result += char
    return result

def caesar_decrypt(text, shift):
    # Decryption is simply encryption with (26 - shift)
    return caesar_encrypt(text, 26 - shift)


# --- Substitution ---
def substitution_process(text, key, operation):
    # ... (implementation omitted for brevity - assuming it's correct)
    
    # Simple substitution logic assuming a valid 26-char key
    key = key.upper()
    if len(key) != 26 or len(set(key)) != 26:
        raise ValueError("Substitution key must be 26 unique letters.")
    
    alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    
    if operation == 'encrypt':
        mapping = {alphabet[i]: key[i] for i in range(26)}
    else: # decrypt
        mapping = {key[i]: alphabet[i] for i in range(26)}
        
    result = ""
    for char in text:
        upper_char = char.upper()
        if upper_char in mapping:
            transformed_char = mapping[upper_char]
            # Maintain case
            result += transformed_char if char.isupper() else transformed_char.lower()
        else:
            result += char
            
    return result

# --- Playfair Cipher (Placeholder) ---
def playfair_process(text, key, operation):
    # 1. تحضير المفتاح وبناء المصفوفة 5x5
    key = key.upper().replace('J', 'I')
    alphabet = "ABCDEFGHIKLMNOPQRSTUVWXYZ" # بدون حرف J
    clean_key = ""
    for char in key + alphabet:
        if char in alphabet and char not in clean_key:
            clean_key += char
    
    matrix = [clean_key[i:i+5] for i in range(0, 25, 5)]
    
    # دالة مساعدة لإيجاد موقع الحرف في المصفوفة
    def find_position(char):
        for r, row in enumerate(matrix):
            if char in row:
                return r, row.index(char)
        return None

    # 2. تجهيز النص (إزالة الرموز، التعامل مع J، وتقسيمه لأزواج)
    text = "".join(re.findall(r'[A-Z]', text.upper())).replace('J', 'I')
    prepared_text = ""
    i = 0
    while i < len(text):
        a = text[i]
        b = text[i+1] if i+1 < len(text) else 'X'
        
        if a == b: # إذا كان الحرفان متشابهان نضع X بينهم
            prepared_text += a + 'X'
            i += 1
        else:
            prepared_text += a + b
            i += 2
    if len(prepared_text) % 2 != 0:
        prepared_text += 'X'

    # 3. عملية التشفير أو فك التشفير
    result = ""
    shift = 1 if operation == 'encrypt' else -1
    
    for i in range(0, len(prepared_text), 2):
        char1, char2 = prepared_text[i], prepared_text[i+1]
        r1, c1 = find_position(char1)
        r2, c2 = find_position(char2)
        
        if r1 == r2: # نفس الصف
            result += matrix[r1][(c1 + shift) % 5]
            result += matrix[r2][(c2 + shift) % 5]
        elif c1 == c2: # نفس العمود
            result += matrix[(r1 + shift) % 5][c1]
            result += matrix[(r2 + shift) % 5][c2]
        else: # شكل مستطيل
            result += matrix[r1][c2]
            result += matrix[r2][c1]
            
    return result
# --- Hill Cipher (Placeholder) ---
def hill_process(text, key, operation):
    # تنظيف النص واستخراج الحروف فقط
    text = "".join(re.findall(r'[A-Za-z]', text)).upper()
    key = key.upper()
    n = int(len(key)**0.5)
    
    if n * n != len(key):
        raise ValueError("Key length must be a perfect square (4, 9, 16).")

    # إنشاء مصفوفة المفتاح
    key_matrix = np.array([ord(c) - ord('A') for c in key]).reshape(n, n)
    
    # إضافة حرف X إذا كان النص لا يقبل القسمة على حجم المصفوفة
    while len(text) % n != 0:
        text += 'X'
    
    # تحويل النص إلى مصفوفة إحداثيات
    text_coords = np.array([ord(c) - ord('A') for c in text]).reshape(-1, n)
    result = ""

    if operation == 'encrypt':
        for row in text_coords:
            # العملية الحسابية: (Vector * Matrix) mod 26
            transformed_row = np.dot(row, key_matrix) % 26
            result += "".join(chr(int(c) + ord('A')) for c in transformed_row)
    else:
        # فك التشفير: نحتاج للمعكوس الضربي للمحدد
        det = int(np.round(np.linalg.det(key_matrix)))
        det_inv = mod_inverse(det % 26, 26)
        
        if det_inv is None:
            raise ValueError("Key matrix is not invertible (No modular inverse).")
        
        # مصفوفة المعكوس: (det_inv * adjugate_matrix) mod 26
        adjugate_matrix = np.round(det * np.linalg.inv(key_matrix)).astype(int)
        inverse_matrix = (det_inv * adjugate_matrix) % 26
        
        for row in text_coords:
            transformed_row = np.dot(row, inverse_matrix) % 26
            result += "".join(chr(int(int(c)) + ord('A')) for c in transformed_row)

    return result

# ----------------------------------------------------
# 3. RSA Key Generation (Run once on startup)
# ----------------------------------------------------

# Generate a new private key (2048-bit key)
# This key is used internally by the server to provide the public/private key pair to the client.
PRIVATE_KEY_RSA = rsa.generate_private_key(
    public_exponent=65537,
    key_size=2048,
    backend=BACKEND
)

# Extract public key
PUBLIC_KEY_RSA = PRIVATE_KEY_RSA.public_key()

# Serialization for output (used in /api/rsa_keys)
PUBLIC_KEY_PEM = PUBLIC_KEY_RSA.public_bytes(
    encoding=serialization.Encoding.PEM,
    format=serialization.PublicFormat.SubjectPublicKeyInfo
).decode('utf-8')

PRIVATE_KEY_PEM = PRIVATE_KEY_RSA.private_bytes(
    encoding=serialization.Encoding.PEM,
    format=serialization.PrivateFormat.PKCS8,
    encryption_algorithm=serialization.NoEncryption()
).decode('utf-8')


# ----------------------------------------------------
# 4. Block Ciphers (AES, DES, 3DES, TEA/ARC4)
# ----------------------------------------------------

def block_cipher_process(cipher_id, text, key, operation):
    key_bytes = key.encode('utf-8')
    is_tea = False

    # Key size validation and algorithm selection
    if cipher_id == '5': # Simple Block Cipher (TEA)
        if len(key_bytes) != 16:
            raise ValueError("TEA key must be 16 bytes (128 bits).")
        # Note: TEA is simulated using AES here for a complete cryptography implementation.
        # Original TEA would use a custom implementation, but AES is used for consistency.
        algorithm = algorithms.AES(key_bytes) 
        is_tea = True
        
    elif cipher_id == '6': # DES
        if len(key_bytes) != 8:
            raise ValueError("DES key must be 8 bytes.")
        algorithm = algorithms.TripleDES(key_bytes) # Using 3DES algo for DES with 8-byte key is common in py crypt libs
        
    elif cipher_id == '7': # 3DES
        if len(key_bytes) not in [16, 24]:
            raise ValueError("3DES key must be 16 or 24 bytes.")
        algorithm = algorithms.TripleDES(key_bytes)
        
    elif cipher_id == '8': # AES-128
        if len(key_bytes) != 16:
            raise ValueError("AES-128 key must be 16 bytes.")
        algorithm = algorithms.AES(key_bytes)
    else:
        raise ValueError("Invalid cipher ID for block processing.")

    # IV is generated randomly and prepended to the ciphertext
    iv = os.urandom(algorithm.block_size // 8)
    
    # Use CBC mode for standard block cipher operation
    cipher = Cipher(algorithm, modes.CBC(iv), backend=BACKEND)
    
    if operation == 'encrypt':
        encryptor = cipher.encryptor()
        
        # Use PKCS7 Padding
        padder = padding.PKCS7(algorithm.block_size).padder()
        padded_data = padder.update(text.encode('utf-8')) + padder.finalize()
        
        ciphertext = encryptor.update(padded_data) + encryptor.finalize()
        
        # Prepend IV to ciphertext before encoding
        final_ciphertext = iv + ciphertext 
        
        return b64encode(final_ciphertext).decode('utf-8')
    
    elif operation == 'decrypt':
        # Decode Base64 input
        data = b64decode(text)
        
        # Extract IV (first block_size bytes)
        iv_length = algorithm.block_size // 8
        iv = data[:iv_length]
        ciphertext = data[iv_length:]
        
        # Decryption setup with extracted IV
        cipher_decrypt = Cipher(algorithm, modes.CBC(iv), backend=BACKEND)
        decryptor = cipher_decrypt.decryptor()
        
        decrypted_padded_data = decryptor.update(ciphertext) + decryptor.finalize()
        
        # Unpadding
        unpadder = padding.PKCS7(algorithm.block_size).unpadder()
        plaintext = unpadder.update(decrypted_padded_data) + unpadder.finalize()
        
        return plaintext.decode('utf-8')


# ----------------------------------------------------
# 5. Flask Routes
# ----------------------------------------------------

app = Flask(__name__)
CORS(app) # Enable CORS for frontend

@app.route('/')
def serve_index():
    """Serve the main HTML file (New.html)."""
    return send_from_directory('.', 'New.html')

@app.route('/<path:path>')
def serve_static(path):
    """Serve static files like Script.js and style.css."""
    # Simple security check to prevent source code leakage
    if path in ['Back.py', 'New.html']:
        return "Access Denied", 403
    return send_from_directory('.', path)

@app.route('/api/rsa_keys', methods=['GET'])
def rsa_keys():
    """Returns the generated RSA public and private keys in PEM format."""
    return jsonify({
        'public_key': PUBLIC_KEY_PEM,
        'private_key': PRIVATE_KEY_PEM
    }), 200

@app.route('/api/cipher', methods=['POST'])
def handle_cipher():
    data = request.get_json()
    cipher_id = data.get('cipher_id')
    operation = data.get('operation')
    text = data.get('text')
    key = data.get('key')
    
    # Basic input validation
    if not all([cipher_id, operation, text, key]):
        return jsonify({'error': 'Missing required fields (cipher_id, operation, text, key)'}), 400

    result = ""
    is_block_cipher = False
    
    try:
        # --- Dispatch based on Cipher ID ---
        if cipher_id == '1': # Caesar
            shift = int(key)
            result = caesar_encrypt(text, shift) if operation == 'encrypt' else caesar_decrypt(text, shift)
            
        elif cipher_id == '2': # Substitution
            result = substitution_process(text, key, operation)
            
        elif cipher_id == '3': # Playfair
            result = playfair_process(text, key, operation)
            
        elif cipher_id == '4': # Hill Cipher
            result = hill_process(text, key, operation)

        elif cipher_id in ['5', '6', '7', '8']: # Block Ciphers
            result = block_cipher_process(cipher_id, text, key, operation)
            is_block_cipher = True
            
        elif cipher_id == '9': # RSA - Asymmetric
            # RSA (2048-bit) can only encrypt ~214 bytes of data with OAEP padding
            if operation == 'encrypt' and len(text.encode('utf-8')) > 214:
                raise ValueError("RSA plaintext is too long for 2048-bit key (Max ~214 bytes).")
                
            key_bytes = key.encode('utf-8')
            
            # Determine the key to use based on operation
            if operation == 'encrypt':
                # Use Public Key for Encryption
                public_key = serialization.load_pem_public_key(key_bytes, backend=BACKEND)
                
                ciphertext = public_key.encrypt(
                    text.encode('utf-8'),
                    rsa_padding.OAEP(
                        mgf=rsa_padding.MGF1(algorithm=hashes.SHA256()),
                        algorithm=hashes.SHA256(),
                        label=None
                    )
                )
                result = b64encode(ciphertext).decode('utf-8')
                is_block_cipher = True # Treated as block cipher for output formatting
                
            elif operation == 'decrypt':
                # Use Private Key for Decryption
                private_key = serialization.load_pem_private_key(key_bytes, password=None, backend=BACKEND)
                
                plaintext = private_key.decrypt(
                    b64decode(text.encode('utf-8')),
                    rsa_padding.OAEP(
                        mgf=rsa_padding.MGF1(algorithm=hashes.SHA256()),
                        algorithm=hashes.SHA256(),
                        label=None
                    )
                )
                result = plaintext.decode('utf-8')
        
        else:
            return jsonify({'error': f'Cipher ID {cipher_id} not supported.'}), 400

        # ----------------------------------------------------------------
        # Standardized output for the frontend
        # ----------------------------------------------------------------
        
        if operation == 'encrypt':
            base64_result = result
            hex_result = "N/A - Classical Cipher"
            
            if is_block_cipher:
                try:
                    # Decoding Base64 to bytes, then converting bytes to Hexadecimal
                    hex_result = b64decode(base64_result).hex()
                except Exception:
                    # Fallback for error in decoding
                    hex_result = "Error generating Hex: Invalid Base64"

            return jsonify({
                'result': base64_result,        # Default output (Base64)
                'base64_output': base64_result,  # Base64 output
                'hex_output': hex_result         # Hexadecimal output
            }), 200

        else: # Decrypt operation
            # Decryption always returns the Plaintext
            return jsonify({
                'result': result, 
                'base64_output': result,      # Placeholder for frontend consistency
                'hex_output': "N/A - Plaintext Output"
            }), 200

    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        # This will catch errors like "Not a DER-encoded key" if the key is wrong
        return jsonify({'error': f"Server Error: {str(e)}"}), 500


if __name__ == '__main__':
    print(f"RSA Keys Generated. Public Key Starts with: {PUBLIC_KEY_PEM[:30]}...")
    print("Running Flask Server on http://127.0.0.1:5000/")
    app.run(debug=True, port=5000)