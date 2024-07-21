import React, { useState, useEffect, KeyboardEvent, useRef } from 'react'
import './App.css'
import axios from 'axios'

const generarId = () => {
  return Date.now()
}

interface Product {
  id: number
  name: string
  quantity: number
  price: number
  checked: number
}

const App: React.FC = () => {
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [price, setPrice] = useState(0)
  const [checked, setChecked] = useState(0)
  const [products, setProducts] = useState<Product[]>([])
  const [editIndex, setEditIndex] = useState<number | null>(null)
  const inutNombre = useRef<HTMLInputElement>(null)
  const topApp = useRef<HTMLInputElement>(null)

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/getp`)
      .then(response => {
        const modifiedProducts = response.data.response.map(
          (product: Product) => {
            if (Number(product.price) === 0) {
              return { ...product, price: 0 }
            }
            return { ...product, price: Math.floor(Number(product.price)) }
          }
        )
        setProducts(modifiedProducts)
      })
      .catch(error => {
        console.error(error)
      })
  }, [])

  const handleAddProduct = () => {
    if (name && quantity > 0) {
      if (editIndex !== null) {
        const updatedProduct: Product = {
          id: editIndex,
          name,
          quantity,
          price,
          checked,
        }

        const updatedProductsedit = [...products]
        console.log(updatedProductsedit)
        const updatedProducts = updatedProductsedit.map(product => {
          return product.id === editIndex ? updatedProduct : product
        })
        console.log(updatedProducts)

        setProducts(updatedProducts)

        // Actualizamos el producto en la API
        axios
          .patch(`${import.meta.env.VITE_API_URL}/editp`, updatedProduct)
          .catch(error => {
            console.error(error)
          })
      } else {
        const newProduct: Product = {
          id: generarId(),
          name,
          quantity,
          price,
          checked,
        }

        setProducts([...products, newProduct])

        // Agregamos el producto a la API
        axios
          .post(`${import.meta.env.VITE_API_URL}/addp`, newProduct)
          .catch(error => {
            console.error(error)
          })
      }
      setName('')
      setQuantity(1)
      setPrice(0)
      setChecked(0)
      setEditIndex(null)
      if (inutNombre.current) {
        inutNombre.current.focus()
      }
    }
  }

  const handleEditProduct = (id: number) => {
    const productToEdit: Product | undefined = products.find(
      product => product.id === id
    )

    if (productToEdit != undefined) {
      setName(productToEdit.name)
      setQuantity(productToEdit.quantity)
      setPrice(productToEdit.price !== 0 ? productToEdit.price : 0)
      setChecked(productToEdit.checked)
      setEditIndex(productToEdit.id)
    }
    if (inutNombre.current !== null) {
      inutNombre.current.focus()
    }
  }

  const handleDeleteProduct = (id: number) => {
    const updatedProducts = products.filter(product => product.id !== id)
    setProducts(updatedProducts)
    // Eliminamos el producto de la API
    axios
      .delete(`${import.meta.env.VITE_API_URL}/deletep/${id}`)
      .catch(error => {
        console.error(error)
      })
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

  const handleCheckProduct = (id: number) => {
    // Buscamos el producto a actualizar
    const productToCheck: Product | undefined = products.find(
      product => product.id === id
    )

    // le cambio el estado de checked
    if (productToCheck) {
      productToCheck.checked = productToCheck.checked === 0 ? 1 : 0
    }

    const updatedProductscheck = [...products]
    updatedProductscheck.map(product => {
      if (product.id === id) {
        product = productToCheck as Product
      }
    })
    setProducts(updatedProductscheck)

    // Actualizamos el producto en la API
    axios
      .patch(`${import.meta.env.VITE_API_URL}/editpcheck`, productToCheck)
      .catch(error => {
        console.error(error)
      })
  }

  const totalQuantity = products.reduce((sum, product) => {
    return product.checked ? sum + product.quantity : sum
  }, 0)

  const totalPriceQuantity = products
    .reduce(
      (sum, product) =>
        sum + (product.checked === 1 ? product.price * product.quantity : 0),
      0
    )
    .toFixed(2)

  const limpiarPrecio = () => {
    const numerosLimpios = Number(price.toString().replace(/[^0-9]/g, ''))
    setPrice(numerosLimpios)
  }

  const obtenerFechaActual = () => {
    const hoy = new Date()
    const mes = (hoy.getMonth() + 1).toString().padStart(2, '0')
    const dia = hoy.getDate().toString().padStart(2, '0')
    return `${hoy.getFullYear()}-${mes}-${dia}`
  }

  const agregarGasto = () => {
    const confirmarEnvio = window.confirm(
      '¿Estás seguro de que quieres agregar este gasto?'
    )

    if (confirmarEnvio) {
      const gasto = {
        id: generarId(),
        gasto: 'Super - Desde listaSuper',
        dia: obtenerFechaActual(),
        monto: totalPriceQuantity,
      }

      axios
        .post(`${import.meta.env.VITE_API_URL_GASTOS}/add`, gasto)
        .then(() => {
          alert('Gasto agregado correctamente en la app de CONTROL DE GASTOS')
        })
        .catch(error => {
          console.error(error)
        })

      // aca borramos todos de la base de datos que esten como checked
      axios
        .delete(`${import.meta.env.VITE_API_URL}/deletepchecked`)
        .then(() => {
          const updatedProducts = products.filter(
            product => product.checked === 0
          )
          setProducts(updatedProducts)
        })
        .catch(error => {
          console.error(error)
        })
    } else {
      console.log('Envío de gasto cancelado.')
    }
  }

  const eliminarTodo = () => {
    const confirmarEnvio = window.confirm(
      '¿Estás seguro de que quieres eliminar todos los productos?'
    )

    if (confirmarEnvio) {
      axios
        .delete(`${import.meta.env.VITE_API_URL}/deleteall`)
        .then(() => {
          setProducts([])
        })
        .catch(error => {
          console.error(error)
        })
    } else {
      console.log('Eliminación de productos cancelada.')
    }
  }

  return (
    <div
      className="mx-auto px-4 py-10 bg-gray-900 text-white w-screen h-screen overflow-y-auto"
      ref={topApp}
    >
      <div className="w-full md:w-2/3 lg:w-1/2 xl:w-1/3 flex flex-col m-auto">
        <div className="mb-4">
          <label className="block mb-2">AGREGAR UN PRODUCTO</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyPress={handleKeyPress}
            className="border rounded-lg p-2 w-full bg-gray-800 text-white"
            ref={inutNombre}
          />
        </div>
        <div className="flex justify-between items-center mb-4">
          <div className="">
            <div className="flex justify-center items-center">
              <button
                onClick={handleDecreaseQuantity}
                className="bg-blue-500 text-white p-1 m-0 flex justify-center rounded-lg"
              >
                <i className="material-icons">remove</i>
              </button>
              <input
                type="text"
                value={quantity}
                readOnly
                onKeyPress={handleKeyPress}
                className="border rounded-lg p-2 w-16 text-center mx-2 bg-gray-800 text-white"
              />
              <button
                onClick={handleIncreaseQuantity}
                className="bg-blue-500 text-white p-1 m-0 flex justify-center rounded-lg"
              >
                <i className="material-icons">add</i>
              </button>
            </div>
          </div>
          {/* {editIndex !== null && (  */}
          <div className="flex flex-row gap-4">
            <div className="flex flex-row justify-center items-center w-full">
              <span className="text-2xl mr-1">$</span>
              <input
                type="number"
                value={price === 0 ? '' : price}
                onChange={e => setPrice(Number(e.target.value))}
                onKeyUp={() => limpiarPrecio()}
                onKeyPress={handleKeyPress}
                className="border rounded-lg p-2 text-center bg-gray-800 text-white no-spinners w-32"
                min={0}
              />
            </div>
            {/* )}  */}
            <button
              className="flex flex-row justify-center items-center"
              onClick={() => setChecked(checked === 0 ? 1 : 0)}
            >
              {checked === 1 ? (
                <i className="material-icons text-green-400 text-4xl">check</i>
              ) : (
                <i className="material-icons text-gray-600 text-4xl">check</i>
              )}
            </button>
          </div>
        </div>
        <button
          onClick={handleAddProduct}
          className="bg-green-700 text-white font-bold p-2 rounded-lg block w-full"
        >
          {editIndex !== null ? 'ACTUALIZAR' : 'AGREGAR'}
        </button>

        <div className="my-4 px-3 py-2 bg-blue-500 font-bold rounded-lg">
          <div className="text-center ">LISTADO DE PRODUCTOS</div>
        </div>

        <div className="flex justify-between items-center bg-gray-900 w-full py-2 px-4 border-2 border-blue-500 rounded-lg mb-2">
          <div className="text-left">{totalQuantity} productos</div>
          <div className="text-right text-green-500 font-bold text-xl">
            $ {totalPriceQuantity}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2">
          <div className="grid grid-cols-3 w-full">
            <div className="text-left">Nombre</div>
            <div className="text-center mr-20">Cantidad</div>
            <div className="text-right mr-20 pr-2">Precio</div>
          </div>
          {products.map(
            product =>
              product.checked === 0 && (
                <div key={product.id} className="flex justify-between">
                  <div
                    key={product.id}
                    className="rounded-lg px-3 py-2 flex justify-between items-center bg-gray-800 cursor-pointer w-full"
                    onClick={() => handleEditProduct(product.id)}
                  >
                    <div className="grid grid-cols-3 w-full">
                      <div className="text-left">{product.name}</div>
                      <div className="text-center">{product.quantity}</div>
                      <div className="text-right">$ {product.price}</div>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteProduct(product.id)}>
                    <i className="material-icons text-red-500 ml-1 mt-2 text-4xl">
                      delete
                    </i>
                  </button>
                  <button onClick={() => handleCheckProduct(product.id)}>
                    <i className="material-icons text-gray-600 ml-2 mt-2 text-4xl">
                      check
                    </i>
                  </button>
                </div>
              )
          )}
          {products.map(
            product =>
              product.checked === 1 && (
                <div key={product.id} className="flex justify-between">
                  <div
                    key={product.id}
                    className="rounded-lg px-3 py-2 flex justify-between items-center bg-green-900 cursor-pointer w-full"
                    onClick={() => handleEditProduct(product.id)}
                  >
                    <div className="grid grid-cols-3 w-full">
                      <div className="text-left">{product.name}</div>
                      <div className="text-center">
                        {product.quantity !== 0 ? product.quantity : ''}
                      </div>
                      <div className="text-right">$ {product.price}</div>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteProduct(product.id)}>
                    <i className="material-icons text-red-500 ml-1 mt-2 text-4xl">
                      delete
                    </i>
                  </button>
                  <button onClick={() => handleCheckProduct(product.id)}>
                    <i className="material-icons text-green-400 ml-2 mt-2 text-4xl">
                      check
                    </i>
                  </button>
                </div>
              )
          )}
        </div>
        <div className="flex justify-between bg-gray-900 w-full py-2 px-4 border-2 border-blue-500 rounded-lg mt-4">
          <button
            className="text-center text-red-500 uppercase"
            onClick={() => eliminarTodo()}
          >
            Eliminar todo
          </button>
          <button
            className="text-center text-green-500 uppercase"
            onClick={() => agregarGasto()}
          >
            Agregar como gasto
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
