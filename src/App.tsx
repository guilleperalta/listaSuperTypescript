import React, { useState, useEffect, KeyboardEvent, useRef } from 'react'
import './App.css'

interface Product {
  id: number
  name: string
  quantity: number
  price: number
}

const App: React.FC = () => {
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [price, setPrice] = useState(0)
  const [products, setProducts] = useState<Product[]>([])
  const [editIndex, setEditIndex] = useState<number | null>(null)
  const inutNombre = useRef<HTMLInputElement>(null)
  const [completedProducts, setCompletedProducts] = useState<Product[]>([])

  useEffect(() => {
    const storedProducts = localStorage.getItem('products')
    if (storedProducts) {
      setProducts(JSON.parse(storedProducts))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products))
  }, [products])

  const handleAddProduct = () => {
    if (name && quantity > 0) {
      if (editIndex !== null && price > 0) {
        // Edit existing product
        const updatedProducts = [...products]
        updatedProducts[editIndex] = { id: editIndex, name, quantity, price }
        setProducts(updatedProducts)
        setEditIndex(null)
      } else {
        // Add new product
        const newProduct: Product = { id: products.length, name, quantity, price }
        setProducts([...products, newProduct])
      }

      // Clear input fields
      setName('')
      setQuantity(1)
      setPrice(0)
      if (inutNombre.current) {
        inutNombre.current.focus();
      }
    }
  }

  const handleCompleteProduct = (index: number) => {
    const updatedProducts = [...products]
    updatedProducts[index].completed = !updatedProducts[index].completed

    if (updatedProducts[index].completed) {
      // Mover producto completado a la lista de completedProducts
      setCompletedProducts([...completedProducts, updatedProducts[index]]);
    } else {
      // Eliminar de completedProducts si se marca como incompleto
      const updatedCompletedProducts = completedProducts.filter((product) => product.id !== updatedProducts[index].id);
      setCompletedProducts(updatedCompletedProducts);
    }

    setProducts(updatedProducts);
  };

  const handleEditProduct = (index: number) => {
    const productToEdit = products[index]
    setName(productToEdit.name)
    setQuantity(productToEdit.quantity)
    setPrice(productToEdit.price)
    setEditIndex(index)
  }

  const handleDeleteProduct = (index: number) => {
    const updatedProducts = products.filter((_, i) => i !== index)
    setProducts(updatedProducts)
  }

  const handleIncreaseQuantity = () => {
    setQuantity(quantity + 1)
  }

  const handleDecreaseQuantity = () => {
    if (quantity > 0) {
      setQuantity(quantity - 1)
    }
  }

  const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleAddProduct()
    }
  }

  const totalQuantity = products.reduce((sum, product) => sum + product.quantity, 0)
  const totalPriceQuantity = products.reduce((sum, product) => sum + product.price, 0)

  return (
    <div className="mx-auto p-4 bg-gray-900 text-white w-screen h-screen">
      <div className=" w-full md:w-2/3 lg:w-1/2 xl:w-1/3 flex flex-col m-auto">
        <div className="mb-4">
          <label className="block mb-2">Agrega un producto</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyPress={handleKeyPress}
            className="border rounded-md p-2 w-full bg-gray-800 text-white"
            ref={inutNombre}
          />
        </div>
        <div className="flex justify-between">
          <div className="mb-4 w-full">
            <div className="flex justify-center items-center">
              <button onClick={handleDecreaseQuantity} className="bg-blue-500 text-white p-1 m-0 flex justify-center rounded-md">
                <i className="material-icons">remove</i>
              </button>
              <input
                type="text"
                value={quantity}
                readOnly
                onKeyPress={handleKeyPress}
                className="border rounded-md p-2 w-16 text-center mx-2 bg-gray-800 text-white"
              />
              <button onClick={handleIncreaseQuantity} className="bg-blue-500 text-white p-1 m-0 flex justify-center rounded-md">
                <i className="material-icons">add</i>
              </button>
            </div>
          </div>
          {editIndex !== null && (
            <div className="mb-4 flex flex-row justify-center items-center w-full">
              <span className="text-2xl">$</span>
              <input
                type="number"
                value={price === 0 ? '' : price}
                onChange={(e) => setPrice(Number(e.target.value))}
                onKeyPress={handleKeyPress}
                className="border rounded-md p-2 text-center bg-gray-800 text-white no-spinners w-32"
              />
            </div>
          )}
        </div>
        <button onClick={handleAddProduct} className="bg-green-500 text-white p-2 rounded-md mb-4 block w-full">
          {editIndex !== null ? 'actualizar' : 'agregar'}
        </button>
        <div className="grid grid-cols-1 gap-2">
          {products.map((product, index) => (
            <div key={index} className="flex justify-between">
              <div
                key={index}
                className="rounded-lg px-3 py-2 flex justify-between items-center bg-gray-800 cursor-pointer w-full"
                onClick={() => handleEditProduct(index)}
              >
                <div className="grid grid-cols-3 w-full">
                  <div className="text-left">{product.name}</div>
                  <div className="text-center">{product.quantity}</div>
                  <div className="text-right">${product.price}</div>
                </div>
              </div>
              <button onClick={() => handleDeleteProduct(index)}>
                <i className="material-icons text-red-500 ml-4 mt-2">delete</i>
              </button>
            </div>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-2 bg-gray-800 rounded-lg px-3 py-2">
          <div className="text-left">Productos: {totalQuantity}</div>
          <div className="text-right">A pagar: ${totalPriceQuantity}</div>
        </div>
      </div>
    </div>
  )
}

export default App
